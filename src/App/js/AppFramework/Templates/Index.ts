function installTemplate(id: string, contents: string) {
    if (document.getElementById(id)) {
        return;
    }

    const template = document.createElement('script');
    template.type = 'text/html';
    template.id = id;
    template.innerHTML = contents;

    document.body.appendChild(template);
}

export default function install() {
    installTemplate('page-error', require('./page-error.html'));
    installTemplate('panel-error', require('./panel-error.html'));
    installTemplate('page-loader', require('./page-loader.html'));
}
