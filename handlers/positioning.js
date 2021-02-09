const GObject = imports.gi.GObject;
const Main = imports.ui.main;
const Lang = imports.lang;

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const Convenience = Me.imports.convenience;

var Positioning = new GObject.Class({
    Name: 'Positioning',
    _init: function (sourceButton) {
        this.button = sourceButton;
        this.extensionEnabled = false;
        this.orderChanging = false;
        this.buttonAttached = false;
    },

    enable() {
        this.extensionEnabled = true
        this.settings = Convenience.getSettings()
        this.settings.connect('changed::position', Lang.bind(this, this._setPosition));
        this.settings.connect('changed::order', Lang.bind(this, this._setOrder));

        this._setPosition();
        this._connectActorChanged();
    },

    disable() {
        this.extensionEnabled = false
        this.buttonAttached = false
        this.panelBox.remove_child(this.button);
    },

    _connectActorChanged() {
        this.conenctionId = this.panelBox.connect('actor_added',
            Lang.bind(this, function (self, actor) {
                if (actor && actor !== this.button &&
                    !this.orderChanging &&
                    this.extensionEnabled) {
                    this._setOrder()
                }
            })
        );
    },

    _disconnectActorChanged() {
        if (this.conenctionId) {
            this.panelBox.disconnect(this.conenctionId);
        }
    },

    _setPosition() {
        this._disconnectActorChanged();
        this._removeControl();

        let position = this.settings.get_string('position');
        if (position === 'right')
            this.panelBox = Main.panel._rightBox;
        else if (position === 'left')
            this.panelBox = Main.panel._leftBox;
        else if (position === 'center')
            this.panelBox = Main.panel._centerBox;

        this._setOrder();
        this._connectActorChanged();
    },

    _setOrder() {
        this.orderChanging = true
        this._removeControl();
        this.panelBox.insert_child_at_index(
            this.button, this.settings.get_int('order'));
        this.orderChanging = false
        this.buttonAttached = true
    },

    _removeControl() {
        if (this.buttonAttached) {
            this.panelBox.remove_child(this.button);
            this.buttonAttached = false;
        }
    }
});
