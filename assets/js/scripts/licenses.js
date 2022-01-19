let licenses = "";

router.paths.licenses.load = async () => {
    if (!licenses) {
        let req = await fetch("/api/licenses");
        let license_json = await req.json();

        if (licenses.length !== 0) return loadLicenses();

        for (const [ title, link, license ] of license_json) {
            if (link) {
                licenses += `<h3><a href="${link}">${title}</a></h3>`;
            } else {
                licenses += `<h3><a href="#">${title}</a></h3>`;
            }
    
            licenses += `<p><code>${license.replace(/\n/g, "<br>")}</code></p>`;
        }
    }

    loadLicenses();
}

function loadLicenses() {
    const section = document.getElementById("licenses");
    if (section) section.innerHTML = licenses;
}