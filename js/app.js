const TEMPLATE_PATH = "assets/instrumento_transacao_template.pdf";
const PAGE_H = 841.92004; // altura A4 em pontos, conforme o template

const FIELD_POS = {
  segurado: { x: 374, bottom: 344.0 },
  veiculo: { x: 172, bottom: 365.97 },
  chassi: { x: 382, bottom: 365.97 },
  placa: { x: 74, bottom: 402.33 },
  apolice: { x: 234, bottom: 402.33 },
};

const REQUIRED_IDS = ["segurado", "veiculo", "chassi", "placa", "apolice"];

const form = document.getElementById("termForm");
const fillBar = document.getElementById("fillBar");
const fillCount = document.getElementById("fillCount");
const submitBtn = document.getElementById("submitBtn");
const resultBox = document.getElementById("resultBox");
const errBanner = document.getElementById("errBanner");
const downloadAgainLink = document.getElementById("downloadAgainLink");

let lastBlobUrl = null;
let lastFileName = "instrumento_preenchido.pdf";

function updateProgress() {
  const filled = REQUIRED_IDS.filter(
    (id) => document.getElementById(id).value.trim().length > 0
  ).length;
  fillCount.textContent = filled;
  fillBar.style.width = (filled / REQUIRED_IDS.length) * 100 + "%";
}

REQUIRED_IDS.forEach((id) => {
  document.getElementById(id).addEventListener("input", () => {
    updateProgress();
    const el = document.getElementById(id);
    el.classList.remove("invalid");
    const msg = el.parentElement.querySelector(".errmsg");
    if (msg) msg.classList.remove("show");
  });
});

function showError(msg) {
  errBanner.textContent = msg;
  errBanner.classList.add("show");
  resultBox.classList.remove("show");
}

function clearBanners() {
  errBanner.classList.remove("show");
  resultBox.classList.remove("show");
}

async function gerarPdf(values) {
  const { PDFDocument, StandardFonts, rgb } = PDFLib;

  const response = await fetch(TEMPLATE_PATH);
  if (!response.ok) {
    throw new Error("Não foi possível carregar o template do documento.");
  }
  const templateBytes = await response.arrayBuffer();

  const pdfDoc = await PDFDocument.load(templateBytes);
  const page = pdfDoc.getPages()[0];
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

  function draw(text, pos) {
    if (!text) return;
    page.drawText(text, {
      x: pos.x,
      y: PAGE_H - pos.bottom + 2,
      size: 9.5,
      font: font,
      color: rgb(0, 0, 0),
    });
  }

  draw(values.segurado, FIELD_POS.segurado);
  draw(values.veiculo, FIELD_POS.veiculo);
  draw(values.chassi, FIELD_POS.chassi);
  draw(values.placa, FIELD_POS.placa);
  draw(values.apolice, FIELD_POS.apolice);

  const outBytes = await pdfDoc.save();
  return new Blob([outBytes], { type: "application/pdf" });
}

function triggerDownload(blob, fileName) {
  if (lastBlobUrl) URL.revokeObjectURL(lastBlobUrl);
  lastBlobUrl = URL.createObjectURL(blob);
  lastFileName = fileName;
  const a = document.createElement("a");
  a.href = lastBlobUrl;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

form.addEventListener("submit", async function (e) {
  e.preventDefault();
  clearBanners();

  let valid = true;
  const values = {};
  REQUIRED_IDS.forEach((id) => {
    const el = document.getElementById(id);
    const v = el.value.trim();
    values[id] = v;
    if (!v) {
      valid = false;
      el.classList.add("invalid");
      const msg = el.parentElement.querySelector(".errmsg");
      if (msg) msg.classList.add("show");
    }
  });

  if (!valid) {
    showError("Preencha todos os campos obrigatórios antes de gerar o PDF.");
    return;
  }

  const sinistro = document.getElementById("sinistro").value.trim();
  const fileName = sinistro
    ? `instrumento_${sinistro}.pdf`
    : "instrumento_preenchido.pdf";

  submitBtn.disabled = true;
  submitBtn.textContent = "Gerando…";

  try {
    const blob = await gerarPdf(values);
    triggerDownload(blob, fileName);
    resultBox.classList.add("show");
  } catch (err) {
    console.error(err);
    showError(
      "Não foi possível gerar o PDF. Verifique sua conexão e tente novamente."
    );
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "Gerar PDF";
  }
});

downloadAgainLink.addEventListener("click", function (e) {
  e.preventDefault();
  if (lastBlobUrl) {
    const a = document.createElement("a");
    a.href = lastBlobUrl;
    a.download = lastFileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }
});

updateProgress();
