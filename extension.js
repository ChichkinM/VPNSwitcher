const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();

const Positioning = Me.imports.handlers.positioning;
const VpnStatus = Me.imports.handlers.vpn_status;
const Control = Me.imports.handlers.control;


let positioning;
let vpn;
let control;

function init() {
}

function enable() {
    vpn = new VpnStatus.VpnStatus();
    control = new Control.Control(vpn);
    positioning = new Positioning.Positioning(control);

    vpn.run(control);
}

function disable() {
    positioning.disable();
    control.disable();
    vpn.disable();

    positioning = null;
    control = null;
    vpn = null;
}
