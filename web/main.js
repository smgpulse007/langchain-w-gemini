import { streamGemini } from './gemini-api.js';

let form = document.querySelector('form');
let imageUpload = document.querySelector('#imageUpload');
let promptInput = document.querySelector('input[name="prompt"]');
let currentStepInput = document.querySelector('input[name="current-step"]');
let imageUploadLabel = document.querySelector('label[for="imageUpload"]');
let imageUploadDiv = document.querySelector('label[for="imageUpload"] div');
let output = document.querySelector('.output');

let uploadedImageBase64 = null;

imageUpload.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            uploadedImageBase64 = e.target.result.split(',')[1];
            imageUploadDiv.remove()
        };
        reader.readAsDataURL(file);
    }
});

form.onsubmit = async (ev) => {
    ev.preventDefault();
    output.textContent = 'Generating...';
    
    // Clear previous output
    output.innerHTML = '';

    try {
        let imageBase64;

    if (uploadedImageBase64) {
        imageBase64 = uploadedImageBase64;
    } else {
        let imageUrl = form.elements.namedItem('chosen-image').value;
    let imageBase64 = await fetch(imageUrl)
      .then(r => r.arrayBuffer())
      .then(a => base64js.fromByteArray(new Uint8Array(a)));

    // Assemble the prompt by combining the text with the chosen image
    let contents = [
      {
            type: "text",
            text: `${promptInput.value} the current step is: ${currentStepInput.value} Provide updated steps`,
        },
        {
            type: "image_url",
            image_url: `data:image/jpeg;base64,${imageBase64}`,
        },
    ];

        // Call the multimodal model, and get a stream of results
        let stream = streamGemini({
            model: 'gemini-1.5-flash', // or gemini-1.5-pro
            contents,
        });

        // Read from the stream and interpret the output as markdown
        let buffer = [];
        let md = new markdownit();
        for await (let chunk of stream) {
            buffer.push(chunk);
            output.innerHTML = md.render(buffer.join(''));
        }
    }
    } catch (e) {
        output.innerHTML += '<hr>' + e;
    }
};
