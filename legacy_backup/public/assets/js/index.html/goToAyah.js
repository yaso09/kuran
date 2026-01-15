sureNames.forEach((sure, i) => {
    const o = document.createElement("option");
    o.value = i + 1;
    o.innerText = sure;

    document.querySelector("#sure").appendChild(o);
})