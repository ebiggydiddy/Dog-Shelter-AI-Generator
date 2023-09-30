const template = 
{
    size: null,
    gender: null,
    color: null,
    age: null,
    coat: null,
    location: null,
    breed: null
}

function generateAttributeString(breeds) {
    var generated_string = '';
    for (const breed in breeds) {
        for (const attribute in breed) {
            generated_string += `&${attribute}=${localStorage[attribute]}`;
        }
    }
    generated_string = generated_string.slice(1);
    return generated_string;
}

async function gptDogBreeds(attributes) {
    const gpt_prompt = `Based on these wanted attributes "${attributes}", what are the best dog breeds? Your response should be location & typically endangered prioritized, JSON parseable, ONLY JSON, and contain the attributes location, breed, type, size, gender, color, age, coat, if recognizable. The JSON should follow the following format, where type is dog/cat/...:
    "{
        "breeds": [
          {
            "breed": "breed1",
            "size": "size1",
            "gender": "gender1",
            "color": "color1",
            "age": "age1",
            "coat": "coat1",
            "location": "location1"
          },...
        ]
    }"`;
    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${'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'}`,
            },
            body: JSON.stringify({
                model: 'gpt-3.5-turbo',
                messages: [{ role: 'user', content: gpt_prompt }],
                temperature: 1.0,
                top_p: 0.7,
                n: 1,
                stream: false,
                presence_penalty: 0,
                frequency_penalty: 0,
            }),
        });

        if (response.ok) {
            const data = await response.json();
            return JSON.parse(data.choices[0].message.content);
        } else {
            throw new Error('Unable to process your request.');
        }
    } catch (error) {
        console.error(error);
    }
}

async function getAdoptionData(attributeString) {
	const access_token = fetch('https://api.petfinder.com/v2/oauth2/token', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded'
			},
			body: 'grant_type=client_credentials&client_id=XSLhFDXGzrvH11iEwAUoqe0lP9XDQ8EvqFCNdvS3wsf5ypYJTG&client_secret=wlztcp4nF0QFCvDsZmQVTlaCRdAvaxR8tKuVwoeQ'
		})
		.then(response => response.json())
		.then(data => {
			return data.access_token
		})
		.catch((error) => {
			console.error('Error ', error);
			return null;
		});

	if (access_token == null) return null;

	const adoption_data = fetch(`https://api.petfinder.com/v2/animals?${attributeString}`, {
			method: 'GET',
			headers: {
				'Authorization': `Bearer ${ await access_token }`
			},
		})
		.then(response => response.json())
		.then(data => {
			return data;
		})
		.catch((error) => {
			console.error('Error:', error);
			return null;
		});
	if (adoption_data == false) return null;

    return adoption_data;
}

const form = document.getElementById('chat-form');
const inputBox = document.getElementById('search');

async function compile(e) {
    e.preventDefault();
    var response = await gptDogBreeds(inputBox.value);
    var apiResponse = await getAdoptionData(generateAttributeString(response));

    console.log(apiResponse);
     for (const animal in apiResponse.animals) {
        var parent = document.createElement("div");
        parent.id = "dog-box";
        console.log(apiResponse.animals[animal]);
        for (const attribute in apiResponse.animals[animal]) {
            console.log(attribute);
            var div = document.createElement("div");
            div.id = apiResponse.animals[animal][attribute];
            div.innerHTML = apiResponse.animals[animal][attribute];
            parent.appendChild(div);
        }
        const bg1 = document.querySelector("#grid-container");
        bg1.appendChild(parent);
        
    }


}

form.addEventListener('submit', async (e) => compile(e));