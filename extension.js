const Main = imports.ui.main;
const {NM, St} = imports.gi;

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const Convenience = Me.imports.convenience;

let button;
let attachedVpnItem;
let settings;

let extensionEnabled = false;
let orderChanging = false;
let buttonAttached = false;

function _onButtonClicked(actor, event) {
    switch (event.get_button()) {
        case 1: {
            _toggleVpn()
            break;
        }
        default:
            break;
    }
}

function _toggleVpn() {
    attachVpn()
    attachedVpnItem._toggle()
}

function init() {
    button = new St.Bin({
        style_class: 'panel-button',
        reactive: true,
        can_focus: true,
        x_fill: true,
        y_fill: false,
        track_hover: true
    });
    let icon = new St.Icon({
        icon_name: 'system-run-symbolic',
        style_class: 'system-status-icon'
    });

    button.set_child(icon);
    button.connect('button-press-event', _onButtonClicked);
}

function enable() {
    extensionEnabled = true
    settings = Convenience.getSettings()
    settings.connect('changed::position', setPosition);
    settings.connect('changed::order', setOrder);
    settings.connect('changed::vpn-name', attachVpn);

    Main.panel._rightBox.connect('actor_added', function (self, actor) {
        if (actor && actor !== button && !orderChanging && extensionEnabled ) {
            setOrder()
        }
    });
    // Main.panel._rightBox.connect('actor_removed', function (self, actor) {
    //     if (actor !== button && !orderChanging && button) {
    //         setOrder()
    //     }
    // });

    subscribeToVpnAttach()
    setOrder()
}

function disable() {
    extensionEnabled = false
    buttonAttached = false
    Main.panel._rightBox.remove_child(button);
}

function setPosition() {
    let position = settings.get_string('position');
    log("###" + position)
}

function setOrder() {
    orderChanging = true
    if( buttonAttached ) {
        Main.panel._rightBox.remove_child(button);
    }
    Main.panel._rightBox.insert_child_at_index(
        button, settings.get_int('order'));
    orderChanging = false
    buttonAttached = true
}

function onAttachedVpnNameChanged() {
    log("### onAttachedVpnNameChanged " + attachedVpnItem.getName())
}

function onAttachedVpnStatusChanged() {
    setIcon()

    if (!attachedVpnItem._activeConnection) {
        log("### onAttachedVpnStatusChanged not active")
        return
    }
    log("### onAttachedVpnStatusChanged " + getStatus(attachedVpnItem._activeConnection.vpn_state))
}

function getStatus(vpn_state) {
    if (!vpn_state)
        return 'invalid';

    switch (vpn_state) {
        case NM.VpnConnectionState.DISCONNECTED:
            return _("disconnected");
        case NM.VpnConnectionState.ACTIVATED:
            return _("connected");
        case NM.VpnConnectionState.PREPARE:
        case NM.VpnConnectionState.CONNECT:
        case NM.VpnConnectionState.IP_CONFIG_GET:
            return _("connecting…");
        case NM.VpnConnectionState.NEED_AUTH:
            /* Translators: this is for network connections that require some kind of key or password */
            return _("authentication required");
        case NM.VpnConnectionState.FAILED:
            return _("connection failed");
        default:
            return 'invalid';
    }
}

function attachVpn() {
    let _network = Main.panel.statusArea.aggregateMenu._network;
    if (!_network) {
        return
    }

    let vpnSection = _network._vpnSection
    if (!vpnSection) {
        return
    }

    attachedVpnItem = undefined
    let vpnName = settings.get_string('vpn-name');

    let vpnItems = _network._vpnSection._connectionItems.values();
    for (let item of vpnItems) {
        if (item.getName() === vpnName) {
            attachedVpnItem = item
            attachedVpnItem.connect('name-changed', onAttachedVpnNameChanged)
            attachedVpnItem.connect('icon-changed', onAttachedVpnStatusChanged)
        }
    }

    setIcon()
}

function subscribeToVpnAttach() {
    let _network = Main.panel.statusArea.aggregateMenu._network;
    let connection = _network._vpnIndicator.connect('notify::visible', function () {
        attachVpn()

        if (attachedVpnItem) {
            _network._vpnIndicator.disconnect(connection)
        }
    });
}

function setIcon() {
    let iconSource = "network-vpn-no-route-symbolic"
    if (attachedVpnItem) {
        iconSource = attachedVpnItem.getIndicatorIcon() === '' ?
            "security-low-symbolic" : attachedVpnItem.getIndicatorIcon()
    }
    let icon = new St.Icon({
        icon_name: iconSource,
        style_class: 'system-status-icon'
    });
    button.set_child(icon);
}
