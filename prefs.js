const GObject = imports.gi.GObject;
const Gtk = imports.gi.Gtk;
const Lang = imports.lang;
const Gio = imports.gi.Gio;

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const Convenience = Me.imports.convenience;

function init() {
}

const VPNSwitcherSettings = new GObject.Class({
    Name: 'VPNSwitcherSettings',
    Extends: Gtk.Grid,

    _init: function (params) {
        this.parent(params);
        this._settings = Convenience.getSettings();

        this.margin = 24;
        this.spacing = 30;
        this.row_spacing = 10;
        let widget;


        this._makeLabel("VPN", 1);
        let buffer = new Gtk.TextBuffer({
            text: this._settings.get_string('vpn-name')
        });
        widget = new Gtk.TextView({
            buffer: buffer
        });
        widget.set_sensitive(true);
        buffer.connect('changed', Lang.bind(this, function () {
            this._settings.set_string('vpn-name', buffer.text)
        }));
        this.attach(widget, 1, 1, 1, 1);


        this._makeLabel("Horizontal alignment", 2);
        widget = new Gtk.ComboBoxText();
        widget.append('center', "Center");
        widget.append('left', "Left");
        widget.append('right', "Right");
        this._settings.bind('position', widget, 'active-id', Gio.SettingsBindFlags.DEFAULT);
        this.attach(widget, 1, 2, 1, 1);


        this._makeLabel("Offset", 3);
        widget = new Gtk.SpinButton({halign: Gtk.Align.END});
        widget.set_sensitive(true);
        widget.set_range(0, 20);
        widget.set_value(this._settings.get_int('order'));
        widget.set_increments(1, 2);
        widget.connect('value-changed', Lang.bind(this, function (w) {
            let value = w.get_value_as_int();
            this._settings.set_int('order', value);
        }));
        this.attach(widget, 1, 3, 1, 1);

        this._makeLabel("Show default menu icon", 4);
        widget = new Gtk.CheckButton({halign: Gtk.Align.END});
        widget.set_sensitive(true);
        widget.set_active(this._settings.get_boolean('show-default-menu-icon'));
        widget.connect('toggled', Lang.bind(this, function (w) {
            let value = w.get_active();
            this._settings.set_boolean('show-default-menu-icon', value);
        }));
        this.attach(widget, 1, 4, 1, 1);
    },

    _makeLabel: function (text, row) {
        var label = new Gtk.Label({
            label: text,
            hexpand: true,
            halign: Gtk.Align.START
        });
        this.attach(label, 0, row, 1, 1);
    }

});

function buildPrefsWidget() {
    let widget = new VPNSwitcherSettings();
    widget.show_all();

    return widget;
}