const fs = require('fs');
require('dotenv').config({ path: '.env.local' });

async function main() {
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    fs.writeFileSync('model_list.txt', "Error: No API key found.");
    return;
  }

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`);
    
    if (!response.ok) {
        fs.writeFileSync('model_list.txt', `Error: ${response.status} ${response.statusText}`);
        return;
    }

    const data = await response.json();
    let output = "Available Models:\n";
    if (data.models) {
        data.models.forEach(m => {
            if (m.name.includes("gemini")) {
                output += `${m.name}\n`;
            }
        });
    } else {
        output += "No models found.\n" + JSON.stringify(data);
    }
    
    fs.writeFileSync('model_list.txt', output);
    console.log("Model list written to model_list.txt");

  } catch (error) {
    fs.writeFileSync('model_list.txt', `Error: ${error.message}`);
  }
}

main();
