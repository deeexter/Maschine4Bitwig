// Written by Jürgen Moßgraber - mossgrabers.de
//            Michael Schmalle - teotigraphix.com
// (c) 2014
// Licensed under LGPLv3 - http://www.gnu.org/licenses/lgpl-3.0.txt

function ScalesMode (model)
{
    BaseMode.call (this, model);
    this.id = Maschine.MODE_SCALE;
    this.isTemporary = false;
    this.scales = model.getScales ();
    this.isInvalidated = false;
}
ScalesMode.prototype = new BaseMode ();

ScalesMode.prototype.onValueKnob = function (index, value)
{
    var isInc = value > 64;

    if (index == 0)
    {
        if (!this.isInvalidated)
        {
            this.isInvalidated = true;
            scheduleTask( doObject(this, function (index, value) {
                var scale = this.scales.getSelectedScale ();
                scale = changeValue (value, scale, 1, this.scales.getScaleSize ());
                this.scales.setScale (scale);
                this.isInvalidated = false;
            }), [index, value], 200);
        }
    }
    else if (index < 7)
    {
        this.scales.setScaleOffset (isInc ? index + 5 : index + 1);
    }
    else
    {
        this.scales.setChromatic (isInc);
    }

    this.update ();
};

ScalesMode.prototype.onFirstRow = function (index)
{
    if (index == 0)
    {
        if (!this.surface.isShiftPressed())
            this.scales.prevScale();
        else
            this.scales.nextScale();
    }
    else if (index > 0 && index < 7)
    {
        if (!this.surface.isShiftPressed())
            this.scales.setScaleOffset(index - 1);
        else
            this.scales.setScaleOffset (index + 5);
    }
    else if (index == 7)
        this.scales.toggleChromatic ();

    this.update ();
};

ScalesMode.prototype.update = function ()
{
    this.surface.getActiveView ().updateNoteMapping ();
    Config.setScale (this.scales.getName (this.scales.getSelectedScale ()));
    Config.setScaleBase (Scales.BASES[this.scales.getScaleOffset ()]);
    Config.setScaleInScale (!this.scales.isChromatic ());
};

Scales.prototype.getRangeText = function ()
{
    var matrix = this.getActiveMatrix ();
    var offset = Scales.OFFSETS[this.scaleOffset];
    return this.formatNote (offset + matrix[0]) + '>' + this.formatNote (offset + matrix[matrix.length - 1]);
};

ScalesMode.prototype.updateDisplay = function ()
{
    var d = this.surface.getDisplay ();
    d.clear ().allDone ();
    var scale = this.scales.getSelectedScale ();
    var offset = this.scales.getScaleOffset ();
    
    d.setBlock (0, 0, ">" + this.scales.getName (scale))
     .clearBlock (0, 1)
     .clearBlock (0, 2)
     .setBlock (0, 3, this.scales.getRangeText ())
     .done (0);
     
    d.setBlock (1, 0, ' ' + this.scales.getName (scale + 1))
     .clearBlock (1, 1)
     .clearBlock (1, 2)
     .clearBlock (1, 3)
     .done (1);

    d.setCell (0, 2, ' ' + this.scales.getName (scale + 2));
    for (var i = 0; i < 6; i++)
        d.setCell (0, i + 1, '  ' + (offset == i ? '>' : ' ') + Scales.BASES[i]);
    d.done (0);

    d.setCell (1, 2, ' ' + this.scales.getName (scale + 3));
    for (var i = 6; i < 12; i++)
        d.setCell (1, i - 5, '  ' + (offset == i ? '>' : ' ') + Scales.BASES[i]);
    d.done (1);

    d.setCell (0, 7, this.scales.isChromatic () ? ' Chrom' : ' InKey').done (0);
};

ScalesMode.prototype.updateFirstRow = function ()
{
//    var offset = this.scales.getScaleOffset ();
//    for (var i = 0; i < 8; i++)
//    {
//        var isFirstOrLast = i == 0 || i == 7;
//        this.surface.setButton (20 + i, i == 7 ? PUSH_COLOR_BLACK : (isFirstOrLast ? PUSH_COLOR_ORANGE_LO : (offset == i - 1 ? PUSH_COLOR_YELLOW_MD : PUSH_COLOR_GREEN_LO)));
//    }
};

ScalesMode.prototype.updateSecondRow = function ()
{
//    var offset = this.scales.getScaleOffset ();
//    for (var i = 0; i < 8; i++)
//    {
//        var isFirstOrLast = i == 0 || i == 7;
//        this.surface.setButton (102 + i, isFirstOrLast ? PUSH_COLOR2_AMBER : (offset == (i - 1) + 6 ? PUSH_COLOR2_YELLOW_HI : PUSH_COLOR2_GREEN_LO));
//    }
};