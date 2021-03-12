const GObject = imports.gi.GObject;
const {St} = imports.gi;
const Lang = imports.lang;
const Main = imports.ui.main;
const Signals = imports.signals;

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const Convenience = Me.imports.convenience;

/**
 * Signals:
 *      switched();
 */
var Control = class Control {
    constructor (vpnPtr) {
        this.vpnPtr = vpnPtr;
        this.settings = Convenience.getSettings()

        this.button = new St.Bin({
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

        this.button.set_child(icon);
        this.button.connect('button-press-event',
            Lang.bind(this, this._onButtonClicked));


        this.showIconConnection = this.settings.connect(
            'changed::show-default-menu-icon',
            Lang.bind(this, this.setVisibleDefaultMenuIcon));

        this.statusChangedConnection = this.vpnPtr.connect(
            'status-changed', Lang.bind(this, this.setIcon));

        this.netReadyConnection = this.vpnPtr.connect(
            'network-ready', Lang.bind(this, this.setVisibleDefaultMenuIcon));
    }

    disable() {
        this.settings.disconnect(this.showIconConnection);
        this.vpnPtr.disconnect(this.statusChangedConnection);
        this.vpnPtr.disconnect(this.netReadyConnection);
    }

    setIcon() {
        let iconSource = "network-vpn-no-route-symbolic"
        if (this.vpnPtr.attachedVpnItem) {
            iconSource = this.vpnPtr.attachedVpnItem.getIndicatorIcon() === '' ?
                "security-low-symbolic" : this.vpnPtr.attachedVpnItem.getIndicatorIcon();
        }
        let icon = new St.Icon({
            icon_name: iconSource,
            style_class: 'system-status-icon'
        });
        this.button.set_child(icon);
    }

    setVisibleDefaultMenuIcon() {
        this.showDefaultMenuIcon = this.settings.get_boolean('show-default-menu-icon');

        let net = Main.panel.statusArea.aggregateMenu._network;
        if (!net)
            return;

        let indicator = net._vpnIndicator;
        if (!indicator)
            return;

        if (!this.showDefaultMenuIcon) {
            this.defaultMenuIndicatorConnection = indicator.connect('notify::visible',
                () => {
                    if (indicator.visible) {
                        indicator.visible = false;
                    }
                }
            );
        } else if (this.defaultMenuIndicatorConnection) {
            indicator.disconnect(this.defaultMenuIndicatorConnection);
        }
    }

    _onButtonClicked(actor, event) {
        switch (event.get_button()) {
            case 1: {
                this.emit('switched');
                break;
            }
            default:
                break;
        }
    }
};
Signals.addSignalMethods(Control.prototype);

