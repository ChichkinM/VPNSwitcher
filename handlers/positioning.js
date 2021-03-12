const GObject = imports.gi.GObject;
const Main = imports.ui.main;
const Lang = imports.lang;
const Signals = imports.signals;

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const Convenience = Me.imports.convenience;

var Positioning = class Positioning{
    constructor (controlPtr) {
        this.button = controlPtr.button;
        this.settings = Convenience.getSettings();

        this.controlMoved = false;
        this.buttonAttached = false;
        this.extensionEnabled = true;

        this.posChangedConnection = this.settings.connect(
            'changed::position', Lang.bind(this, this._setPosition));
        this.orderChangedConnection = this.settings.connect(
            'changed::order', Lang.bind(this, this._setOrder));

        this._setPosition();
        this._connectActorChanged();
    }

    disable() {
        this._disconnectActorChanged();
        this.settings.disconnect(this.posChangedConnection);
        this.settings.disconnect(this.orderChangedConnection);

        this._removeControl();
        this.extensionEnabled = false;
    }

    _connectActorChanged() {
        this.conenctionId = this.panelBox.connect('actor_added',
            Lang.bind(this, function (self, actor) {
                if (actor && actor !== this.button &&
                    !this.controlMoved &&
                    this.extensionEnabled) {
                    this._setOrder();
                }
            })
        );
    }

    _disconnectActorChanged() {
        if (this.conenctionId) {
            this.panelBox.disconnect(this.conenctionId);
        }
    }

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
    }

    _setOrder() {
        this.controlMoved = true;
        this._removeControl();
        this.panelBox.insert_child_at_index(
            this.button, this.settings.get_int('order'));
        this.controlMoved = false;
        this.buttonAttached = true;
    }

    _removeControl() {
        if (this.buttonAttached && this.panelBox) {
            this.controlMoved = true;
            this.panelBox.remove_child(this.button);
            this.buttonAttached = false;
            this.controlMoved = false;
        }
    }
};
