const apiKey="ed69ef3b35e62a8770fa3deec86e7956";
const input = document.getElementById("busqueda");
const boton = document.getElementById("lupita");
const weatherDisplay = document.getElementById("weatherDisplay");
const sugerencias = document.getElementById("sugerencias");


boton.addEventListener("click", () => {
    const ciudad = input.value.trim()

    if(ciudad === ""){
        weatherDisplay.innerHTML = "<p>Ingresa una ciudad</p>";
        return;
    }

    obtenerClima(ciudad);

});


async function obtenerClima(ciudad){

    try{

        const url =
        'https://api.openweathermap.org/data/2.5/weather?q=${ciudad}&appid=${apiKey}&units=metric&lang=es';

        const respuesta = await fetch(url);

        if(!respuesta.ok){
            throw new Error("Ciudad no encontrada");
        }

        const data = await respuesta.json();

        mostrarClima(data);

    }
    catch(error){

        weatherDisplay.innerHTML = `
            <p style="color:red;">
                ${error.message}
            </p>
        `;
    }

}



function mostrarClima(data){

    document.getElementById("mensajeClima").style.display="none";

    document.getElementById("weatherCard").style.display="block";

    document.getElementById("nombreCiudad").textContent =
    data.name;

    document.getElementById("temp").textContent =
    data.main.temp + " °C";

    document.getElementById("viento").textContent =
    data.wind.speed + " m/s";

    document.getElementById("humedad").textContent =
    data.main.humidity + "%";

    document.getElementById("presion").textContent =
    data.main.pressure + " hPa";

    document.getElementById("visibilidad").textContent =
    (data.visibility/1000) + " km";

    const iconCode=data.weather[0].icon;

 document.getElementById("iconoClima").src=
 `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
}





input.addEventListener("keyup", async () => {

    const texto = input.value.trim();

    if(texto.length < 2){
        sugerencias.innerHTML = "";
        return;
    }

    try{

        const url =
        `https://api.openweathermap.org/geo/1.0/direct?q=${texto}&limit=5&appid=${apiKey}`;

        const respuesta = await fetch(url);

        const ciudades = await respuesta.json();

        mostrarSugerencias(ciudades);

    }
    catch(error){
        console.log(error);
    }

});



function mostrarSugerencias(ciudades){

    sugerencias.innerHTML = "";

    ciudades.forEach(ciudad => {

        const li = document.createElement("li");

        li.textContent =
        `${ciudad.name}, ${ciudad.country}`;

        li.addEventListener("click", ()=>{

            input.value = ciudad.name;

            sugerencias.innerHTML = "";

            obtenerClimaPorCoords(
        ciudad.lat,
        ciudad.lon
    );
async function obtenerClimaPorCoords(lat, lon){

    try{

        const url =
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=es`;

        const respuesta = await fetch(url);

        if(!respuesta.ok){
            throw new Error("Ciudad no encontrada");
        }

        const data = await respuesta.json();

        mostrarClima(data);

    }

    catch(error){

        weatherDisplay.innerHTML=
        `<p>${error.message}</p>`;

    }

}
        });

        sugerencias.appendChild(li);

    });

}
    