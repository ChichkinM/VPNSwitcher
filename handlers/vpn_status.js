const GObject = imports.gi.GObject;
const Main = imports.ui.main;
const Net = imports.ui.status.network;
const Lang = imports.lang;
const {NM, Clutter} = imports.gi;
const Signals = imports.signals;

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const Convenience = Me.imports.convenience;

/**
 * Signals:
 *      network-ready();
 *      status-changed();
 */
var VpnStatus = class VpnStatus {
    run(controlPtr) {
        this.controlPtr = controlPtr;
        this.settings = Convenience.getSettings();

        this.vpnNameChangedConnection = this.settings.connect(
            'changed::vpn-name', Lang.bind(this, this.attachVpn));
        this.switchedConnection = this.controlPtr.connect(
            'switched', Lang.bind(this, this.toggle));

        this.attachVpn();
        this.subscribeToVpnAttach();
    }

    disable() {
        this.settings.disconnect(this.vpnNameChangedConnection);
        this.controlPtr.disconnect(this.switchedConnection);
    }

    toggle() {
        this.attachedVpnItem._toggle();
    }

    onAttachedVpnNameChanged() {
        this.settings.set_string('vpn-name', this.attachedVpnItem.getName());
    }

    onAttachedVpnStatusChanged() {
        this.emit('status-changed');
    }

    attachVpn() {
        let _network = Main.panel.statusArea.aggregateMenu._network;
        if (!_network) {
            return;
        }

        let vpnSection = _network._vpnSection
        if (!vpnSection) {
            return;
        }

        this.attachedVpnItem = undefined;
        let vpnName = this.settings.get_string('vpn-name');

        let vpnItems = _network._vpnSection._connectionItems.values();
        for (let item of vpnItems) {
            if (item.getName() === vpnName) {
                this.attachedVpnItem = item;
                this.attachedVpnItem.connect('name-changed',
                    Lang.bind(this, this.onAttachedVpnNameChanged));
                this.attachedVpnItem.connect('icon-changed',
                    Lang.bind(this, this.onAttachedVpnStatusChanged));
                break;
            }
        }
        this.emit('status-changed');
    }

    subscribeToVpnAttach() {
        let _network = Main.panel.statusArea.aggregateMenu._network;
        let visibleChangedConnection = _network._vpnIndicator.connect(
            'notify::visible',
            Lang.bind(this, function () {
            this.attachVpn();

            if (this.attachedVpnItem) {
                _network._vpnIndicator.disconnect(visibleChangedConnection);
                this.emit('network-ready');
            }
        }));
    }

};
Signals.addSignalMethods(VpnStatus.prototype);
