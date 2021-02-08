const GObject = imports.gi.GObject;
const {St} = imports.gi;
const Lang = imports.lang;

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const Convenience = Me.imports.convenience;

var Control = new GObject.Class({
    Name: 'Control',
    init(sourceToggleCallback) {
        this.toggleCallback = sourceToggleCallback;

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
    },

    enable() {
    },

    disable() {
    },

    setIcon(attachedVpnItem) {
        let iconSource = "network-vpn-no-route-symbolic"
        if (attachedVpnItem) {
            iconSource = attachedVpnItem.getIndicatorIcon() === '' ?
                "security-low-symbolic" : attachedVpnItem.getIndicatorIcon()
        }
        let icon = new St.Icon({
            icon_name: iconSource,
            style_class: 'system-status-icon'
        });
        this.button.set_child(icon);
    },

    _onButtonClicked(actor, event) {
        switch (event.get_button()) {
            case 1: {
                this.toggleCallback()
                break;
            }
            default:
                break;
        }
    }
});
