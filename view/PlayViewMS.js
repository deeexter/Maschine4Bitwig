// Written by Michael Schmalle - teotigraphix.com
// (c) 2014
// Licensed under LGPLv3 - http://www.gnu.org/licenses/lgpl-3.0.txt

function PlayViewMS (model)
{
    BaseMaschineView.call (this, model);
}

PlayViewMS.prototype = new BaseMaschineView ();

PlayViewMS.prototype.attachTo = function (surface)
{
    //println("PlayViewMS.attachTo() " + surface);
    AbstractView.prototype.attachTo.call (this, surface);

    this.scales = this.model.getScales ();
    this.noteMap = this.scales.getEmptyMatrix ();
    this.pressedKeys = initArray (0, 128);
    this.defaultVelocity = [];
    for (var i = 0; i < 128; i++)
        this.defaultVelocity.push (i);
};

PlayViewMS.prototype.updateNoteMapping = function ()
{
    var t = this.model.getTrackBank ().getSelectedTrack ();
    this.noteMap = t != null && t.canHoldNotes ? this.scales.getNoteMatrix () : this.scales.getEmptyMatrix ();
    // Workaround: https://github.com/git-moss/Push4Bitwig/issues/7
    scheduleTask (doObject (this, function () { this.surface.setKeyTranslationTable (this.noteMap); }), null, 100);
};

PlayViewMS.prototype.onActivate = function ()
{
    AbstractView.prototype.onActivate.call (this);
    this.surface.setButton (MaschineButton.PAD_MODE, MaschineButton.STATE_DOWN);
    this.surface.setButton (MaschineButton.STEP_MODE, MaschineButton.STATE_UP);
    this.surface.setButton (MaschineButton.SCENE, MaschineButton.STATE_UP);
    this.model.getTrackBank ().setIndication (false);
    this.updateSceneButtons ();
    this.initMaxVelocity ();
};

PlayViewMS.prototype.updateSceneButtons = function (buttonID)
{
    //for (var i = 0; i < 8; i++)
    //    this.push.setButton (PUSH_BUTTON_SCENE1 + i, PUSH_COLOR_BLACK);
};

PlayViewMS.prototype.usesButton = function (buttonID)
{
    return true;
};

PlayViewMS.prototype.drawGrid = function ()
{
    var t = this.model.getCurrentTrackBank ().getSelectedTrack ();
    var isKeyboardEnabled = t != null && t.canHoldNotes;
    var isRecording = this.model.hasRecordingState ();
    //println("PlayViewMS.drawGrid():" + isRecording);
    for (var i = 36; i < 52; i++)
    {
        this.surface.pads.light (i, isKeyboardEnabled ? (this.pressedKeys[i] > 0 ?
            (isRecording ? COLOR.ARM : COLOR.PLAY) :
            this.scales.getColor (this.noteMap, i)) : COLOR.OFF, null, false);
    }
};

PlayViewMS.prototype.onGridNote = function (note, velocity)
{
    //println("note:" + note);
    var t = this.model.getCurrentTrackBank ().getSelectedTrack ();
    if (t == null || !t.canHoldNotes)
        return;
    // Mark selected notes
    for (var i = 0; i < 128; i++)
    {
        if (this.noteMap[note] == this.noteMap[i])
            this.pressedKeys[i] = velocity;
    }
};

// PlayViewMS.prototype.onOctaveDown = function (event)
// PlayViewMS.prototype.onOctaveUp = function (event)

PlayViewMS.prototype.onLeftArrow = function (event)
{
    if (!event.isDown ())
        return;

    var sel = this.model.getTrackBank ().getSelectedTrack ();
    var index = sel == null ? 0 : sel.index - 1;
    if (index == -1)
    {
        if (!this.model.getTrackBank ().canScrollTracksUp ())
            return;
        this.model.getTrackBank ().scrollTracksPageUp ();
        scheduleTask (doObject (this, this.selectTrack), [7], 75);
        return;
    }
    this.selectTrack (index);
};

PlayViewMS.prototype.onRightArrow = function (event)
{
    if (!event.isDown ())
        return;

    var sel = this.model.getTrackBank ().getSelectedTrack ();
    var index = sel == null ? 0 : sel.index + 1;
    if (index == 8)
    {
        var tb = this.model.getTrackBank ();
        if (!tb.canScrollTracksDown ())
            return;
        tb.scrollTracksPageDown ();
        scheduleTask (doObject (this, this.selectTrack), [0], 75);
    }
    this.selectTrack (index);
};

PlayViewMS.prototype.scrollUp = function (event)
{
    this.model.getApplication ().arrowKeyUp ();
};

PlayViewMS.prototype.scrollDown = function (event)
{
    this.model.getApplication ().arrowKeyDown ();
};

PlayViewMS.prototype.scrollLeft = function (event)
{
    this.model.getApplication ().arrowKeyLeft ();
    //if (this.surface.getCurrentMode () == MODE_DEVICE /*|| this.surface.getCurrentMode () == */)
    //    this.model.getCursorDevice ().selectPrevious ();
    //else
    //{
//        var sel = this.model.getTrackBank ().getSelectedTrack ();
//        var index = sel == null ? 0 : sel.index - 1;
//        if (index == -1)
//        {
//            if (!this.model.getTrackBank ().canScrollTracksUp ())
//                return;
//            this.model.getTrackBank ().scrollTracksPageUp ();
//            scheduleTask (doObject (this, this.selectTrack), [7], 75);
//            return;
//        }
//        this.selectTrack (index);
    //}
};

PlayViewMS.prototype.scrollRight = function (event)
{
    this.model.getApplication ().arrowKeyRight ();
    //if (this.surface.getCurrentMode () == MODE_DEVICE /*|| this.surface.getCurrentMode () == MODE_PRESET*/)
    //    this.model.getCursorDevice ().selectNext ();
    //else
    //{
//        var sel = this.model.getTrackBank ().getSelectedTrack ();
//        var index = sel == null ? 0 : sel.index + 1;
//        if (index == 8)
//        {
//            var tb = this.model.getTrackBank ();
//            if (!tb.canScrollTracksDown ())
//                return;
//            tb.scrollTracksPageDown ();
//            scheduleTask (doObject (this, this.selectTrack), [0], 75);
//        }
//        this.selectTrack (index);
    //}
};




// PlayViewMS.prototype.onAccent = function (event)

PlayViewMS.prototype.initMaxVelocity = function ()
{
    this.maxVelocity = initArray (Config.fixedAccentValue, 128);
    this.maxVelocity[0] = 0;
    this.surface.setVelocityTranslationTable (Config.accentActive ? this.maxVelocity : this.defaultVelocity);
};