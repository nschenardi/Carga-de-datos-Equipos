// Kill switch remoto (archivo JSON en GitHub con { "active": true/false })
const LICENSE_URL = "https://raw.githubusercontent.com/tuusuario/tu-repo/main/license.json";

// Validación login
const loginForm = document.getElementById("login-form");
const app = document.getElementById("app");
const loginView = document.getElementById("login-view");
loginForm.addEventListener("submit", e => {
  e.preventDefault();
  const user = document.getElementById("username").value;
  const pass = document.getElementById("password").value;
  if(user==="operaciones" && pass==="planta2025"){
    loginView.classList.add("hidden");
    app.classList.remove("hidden");
  } else {
    alert("Usuario o contraseña incorrectos");
  }
});

// Logout
document.getElementById("logout-btn").onclick = ()=> {
  app.classList.add("hidden");
  loginView.classList.remove("hidden");
};

// Fecha y hora en header
function updateDateTime(){
  document.getElementById("datetime").textContent =
    new Date().toLocaleString();
}
setInterval(updateDateTime,1000);
updateDateTime();

// Mostrar/ocultar campos según equipo
const tipoEquipo = document.getElementById("tipo-equipo");
const generalFields = document.getElementById("general-fields");
const tanquesSection = document.getElementById("tanques-section");
const tanquesContainer = document.getElementById("tanques-container");

tipoEquipo.addEventListener("change", ()=>{
  if(tipoEquipo.value==="Tanque"){
    generalFields.classList.add("hidden");
    tanquesSection.classList.remove("hidden");
    generarTanques();
  } else {
    generalFields.classList.remove("hidden");
    tanquesSection.classList.add("hidden");
    tanquesContainer.innerHTML="";
  }
});

// Generar campos de tanques
function generarTanques(){
  const tanques = [
    "Tanque 1 — Propano Fuera de Especificación",
    "Tanque 2 — Butano Fuera de Especificación",
    "Tanque 3 — Butano","Tanque 4 — Butano",
    "Tanque 5 — Propano","Tanque 6 — Propano",
    "Tanque 7 — Gasolina"
  ];
  tanquesContainer.innerHTML="";
  tanques.forEach((nombre,i)=>{
    const idx = i+1;
    let html = `<div class="card" style="margin-bottom:1rem;">
      <h4>${nombre}</h4>
      <label>Nivel (cm)<input type="number" id="t${idx}-nivel"></label>`;
    if(idx<7){
      html+=`<label>Presión (kg/cm²)<input type="number" id="t${idx}-presion"></label>
             <label>Temperatura (°C)<input type="number" id="t${idx}-temp"></label>`;
    }
    html+=`</div>`;
    tanquesContainer.innerHTML+=html;
  });
}

// Generar PDF
document.getElementById("save-btn").onclick = async ()=>{
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  let y=10;
  doc.setFontSize(16);
  doc.text("Informe de Equipo",10,y); y+=10;
  doc.setFontSize(12);
  doc.text("Fecha y hora: "+new Date().toLocaleString(),10,y); y+=10;

  // Operador
  doc.text("Operador: "+document.getElementById("operador").value,10,y); y+=10;
  doc.text("Legajo: "+document.getElementById("legajo").value,10,y); y+=10;

  // Tipo equipo
  doc.text("Equipo: "+tipoEquipo.value,10,y); y+=10;

  if(tipoEquipo.value==="Tanque"){
    for(let i=1;i<=7;i++){
      doc.text(`Tanque ${i}`,10,y); y+=8;
      doc.text("Nivel: "+(document.getElementById(`t${i}-nivel`).value||"-"),15,y); y+=8;
      if(i<7){
        doc.text("Presión: "+(document.getElementById(`t${i}-presion`).value||"-"),15,y); y+=8;
        doc.text("Temperatura: "+(document.getElementById(`t${i}-temp`).value||"-"),15,y); y+=8;
      }
    }
  } else {
    doc.text("Número de Serie: "+(document.getElementById("numero-serie").value||"-"),10,y); y+=10;
    doc.text("Ubicación: "+(document.getElementById("ubicacion").value||"-"),10,y); y+=10;
    doc.text("Estado: "+(document.getElementById("estado").value||"-"),10,y); y+=10;
    doc.text("Observaciones: "+(document.getElementById("observaciones").value||"-"),10,y); y+=10;
  }

  doc.save("informe_equipo.pdf");
  document.getElementById("save-status").textContent="Informe generado y descargado";
};

// Compartir vía WhatsApp o Email
document.getElementById("share-btn").onclick = ()=>{
  const text="Informe generado desde DATA EQUIPMENT";
  const wa="https://wa.me/?text="+encodeURIComponent(text);
  const mail="mailto:?subject=Informe Equipo&body="+encodeURIComponent(text);
  if(confirm("¿Compartir por WhatsApp?")){
    window.open(wa,"_blank");
  } else {
    window.location.href=mail;
  }
};

// Kill switch remoto
async function checkLicense(){
  try {
    const res = await fetch(LICENSE_URL);
    const data = await res.json();
    if(!data.active){
      document.getElementById("license-overlay").classList.remove("hidden");
    }
  } catch(e){
    console.warn("No se pudo verificar licencia",e);
  }
}
checkLicense();
