const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();

const Positioning = Me.imports.handlers.positioning;
const VpnStatus = Me.imports.handlers.vpn_status;
const Control = Me.imports.handlers.control;


let positioning;
let vpn;
let control;

function init() {
    vpn = new VpnStatus.VpnStatus();
    control = new Control.Control();

    control.init(() => vpn.toggle());
    vpn.init((item) => control.setIcon(item));

    vpn.connect('network-ready', () => {
        control.setVisibleDefaultMenuIcon()
    });

    positioning = new Positioning.Positioning(control.button);
}

function enable() {
    vpn.enable();
    control.enable();
    positioning.enable();
}

function disable() {
    vpn.disable();
    control.disable();
    positioning.disable();
}
