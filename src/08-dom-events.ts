// 目标：理解 DOM 可空性与 EventTarget。此 Demo 在 Node 中只输出说明。
function bindForm(document: Document): void {
  const form = document.querySelector<HTMLFormElement>("#login-form");
  if (!form) return;

  form.addEventListener("submit", event => {
    event.preventDefault();
    const data = new FormData(form);
    const email = data.get("email"); // FormDataEntryValue | null
    if (typeof email === "string") console.log(email.trim());
  });
}

console.log("08", "bindForm 需要在浏览器中传入 document；类型检查仍可在 Node 项目中完成");
void bindForm;
