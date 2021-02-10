const GObject = imports.gi.GObject;
const Main = imports.ui.main;
const Lang = imports.lang;
const {NM} = imports.gi;

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const Convenience = Me.imports.convenience;

var VpnStatus = new GObject.Class({
    Name: 'VpnStatus',
    Signals: {
        'network-ready': {},
    },

    init(sourceStatusChangedCallback) {
        this.statusChangedCallback = sourceStatusChangedCallback;
    },

    enable() {
        this.settings = Convenience.getSettings()
        this.settings.connect('changed::vpn-name', Lang.bind(this, this.attachVpn));

        this.attachVpn()
        this.subscribeToVpnAttach()
    },

    disable() {
    },

    toggle() {
        this.attachedVpnItem._toggle()
    },

    onAttachedVpnNameChanged() {
        this.settings.set_string('vpn-name', this.attachedVpnItem.getName());
    },

    onAttachedVpnStatusChanged() {
        this.statusChangedCallback(this.attachedVpnItem);

        if (!this.attachedVpnItem._activeConnection) {
            log("### onAttachedVpnStatusChanged not active")
            return
        }
        log("### onAttachedVpnStatusChanged " + this.getStatus(
            this.attachedVpnItem._activeConnection.vpn_state))
    },

    getStatus(vpn_state) {
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
    },

    attachVpn() {
        let _network = Main.panel.statusArea.aggregateMenu._network;
        if (!_network) {
            return
        }

        let vpnSection = _network._vpnSection
        if (!vpnSection) {
            return
        }

        this.attachedVpnItem = undefined
        let vpnName = this.settings.get_string('vpn-name');

        let vpnItems = _network._vpnSection._connectionItems.values();
        for (let item of vpnItems) {
            if (item.getName() === vpnName) {
                this.attachedVpnItem = item
                this.attachedVpnItem.connect('name-changed',
                    Lang.bind(this, this.onAttachedVpnNameChanged));
                this.attachedVpnItem.connect('icon-changed',
                    Lang.bind(this, this.onAttachedVpnStatusChanged));
            }
        }

        this.statusChangedCallback(this.attachedVpnItem);
    },

    subscribeToVpnAttach() {
        let _network = Main.panel.statusArea.aggregateMenu._network;
        let connection = _network._vpnIndicator.connect('notify::visible', Lang.bind(this, function () {
            this.attachVpn()

            if (this.attachedVpnItem) {
                _network._vpnIndicator.disconnect(connection)
                this.emit('network-ready');
            }
        }));
    }

});
