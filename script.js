// ===================== KILL SWITCH REMOTO =====================
const LICENSE_URL = "https://raw.githubusercontent.com/nschenardi/Carga-de-datos-Equipos/main/license.json";

async function checkLicense() {
  try {
    const response = await fetch(LICENSE_URL, { cache: "no-cache" });
    const data = await response.json();
    if (data.active === true) {
      document.getElementById("login-view").classList.remove("hidden");
      document.getElementById("license-overlay").classList.add("hidden");
    } else {
      document.body.innerHTML = "<h1 style='text-align:center; margin-top:50px;'>🚫 Servicio desactivado. Contacte al administrador</h1>";
    }
  } catch (err) {
    console.error("Error verificando licencia:", err);
    document.body.innerHTML = "<h1 style='text-align:center; margin-top:50px;'>⚠️ Error de conexión con el servidor</h1>";
  }
}

checkLicense();

// ===================== LOGIN =====================
const VALID_USER = "operaciones";
const VALID_PASS = "planta2025";

document.getElementById("login-btn").addEventListener("click", function() {
  const username = document.getElementById("login-user").value;
  const password = document.getElementById("login-pass").value;

  if(username === VALID_USER && password === VALID_PASS) {
    document.getElementById("login-view").classList.add("hidden");
    document.getElementById("app-view").classList.remove("hidden");
    initApp();
  } else {
    alert("Usuario o contraseña incorrectos");
  }
});

// ===================== APP PRINCIPAL =====================
function initApp() {
  document.getElementById("fecha-hora").innerText = new Date().toLocaleString();

  const tipoEquipoSelect = document.getElementById("tipo-equipo");
  const equipoContainer = document.getElementById("equipo-container");

  // Mostrar campos según tipo de equipo
  tipoEquipoSelect.addEventListener("change", function() {
    const tipo = this.value;
    equipoContainer.innerHTML = ""; // limpiar

    if(tipo === "Tanque") {
      // Mostrar campos especiales de tanques
      const tanques = [
        {nombre:"Tanque 1", tipo:"Propano Fuera de Especificación", campos:["Nivel (cm)"]},
        {nombre:"Tanque 2", tipo:"Butano Fuera de Especificación", campos:["Nivel (cm)"]},
        {nombre:"Tanque 3", tipo:"Butano", campos:["Nivel (cm)"]},
        {nombre:"Tanque 4", tipo:"Butano", campos:["Nivel (cm)"]},
        {nombre:"Tanque 5", tipo:"Propano", campos:["Nivel (cm)"]},
        {nombre:"Tanque 6", tipo:"Propano", campos:["Nivel (cm)"]},
        {nombre:"Tanque 7", tipo:"Gasolina", campos:["Nivel (cm)"]}
      ];

      tanques.forEach(t => {
        const div = document.createElement("div");
        div.classList.add("tanque-card");
        div.innerHTML = `<h3>${t.nombre} (${t.tipo})</h3>`;
        t.campos.forEach(c => {
          div.innerHTML += `<label>${c}: <input type="number" class="input-tanque" placeholder="${c}"></label>`;
        });
        equipoContainer.appendChild(div);
      });

    } else {
      // Mostrar campos normales
      equipoContainer.innerHTML = `
        <label>Número de Serie: <input type="text" id="num-serie"></label>
        <label>Ubicación: <input type="text" id="ubicacion"></label>
        <label>Estado: 
          <select id="estado">
            <option value="Activo">Activo</option>
            <option value="Stand by">Stand by</option>
            <option value="Fuera de Servicio">Fuera de Servicio</option>
          </select>
        </label>
        <label>Observaciones: <textarea id="observaciones"></textarea></label>
        <label>Foto del Equipo: <input type="file" accept="image/*" id="foto-equipo" capture="camera"></label>
      `;
    }
  });

  // Botón generar PDF
  document.getElementById("btn-generar-pdf").addEventListener("click", function() {
    generarPDF();
  });

  // Botón enviar WhatsApp
  document.getElementById("btn-whatsapp").addEventListener("click", function() {
    enviarWhatsApp();
  });

  // Botón enviar Email
  document.getElementById("btn-email").addEventListener("click", function() {
    enviarEmail();
  });
}

// ===================== FUNCIONES =====================
function generarPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  doc.setFontSize(16);
  doc.text("Informe de Carga de Equipos Industriales", 10, 10);
  doc.setFontSize(12);
  doc.text(`Fecha y Hora: ${new Date().toLocaleString()}`, 10, 20);

  const operador = document.getElementById("nombre-operador").value;
  const legajo = document.getElementById("legajo-operador").value;
  doc.text(`Operador: ${operador} | Legajo: ${legajo}`, 10, 30);

  const tipo = document.getElementById("tipo-equipo").value;
  doc.text(`Tipo de Equipo: ${tipo}`, 10, 40);

  if(tipo === "Tanque") {
    const inputs = document.querySelectorAll(".input-tanque");
    inputs.forEach((inp, i) => {
      doc.text(`Tanque ${i+1}: ${inp.value}`, 10, 50 + i*10);
    });
  } else {
    const numSerie = document.getElementById("num-serie").value;
    const ubicacion = document.getElementById("ubicacion").value;
    const estado = document.getElementById("estado").value;
    const obs = document.getElementById("observaciones").value;

    doc.text(`Número de Serie: ${numSerie}`, 10, 50);
    doc.text(`Ubicación: ${ubicacion}`, 10, 60);
    doc.text(`Estado: ${estado}`, 10, 70);
    doc.text(`Observaciones: ${obs}`, 10, 80);

    const foto = document.getElementById("foto-equipo").files[0];
    if(foto) {
      const reader = new FileReader();
      reader.onload = function(e) {
        doc.addImage(e.target.result, 'JPEG', 10, 90, 50, 50);
        doc.save(`Informe_${tipo}_${new Date().toISOString()}.
