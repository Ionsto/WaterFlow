module normal{
class Grid {
    public SizeX = 100;
    public SizeY = 100;
    public SizeTotal = this.SizeX * this.SizeY;
    RawGrid :Int32Array;
    MaxHeight = 50;
    Averadge = 0;
    constructor(x: number, y: number,d = 0) {
        this.SizeX = x;
        this.SizeY = y;
        this.RawGrid = new Float64Array(x * y);
        if (d != 0) {
            for (var i = 0; i < x * y; ++i) {
                this.RawGrid[i] = d;
            }
        }
    }
    public GetValueAt(x: number, y: number): number {
        if (x >= 0 && x < this.SizeX) {
            if (y >= 0 && y < this.SizeY) {
                return this.RawGrid[(x * this.SizeX) + y];
            }
        }
        return -1;
    }
    public SetValueAt(x: number, y: number, v: number) {
        if (x >= 0 && x < this.SizeX) {
            if (y >= 0 && y < this.SizeY) {
                if (v > this.MaxHeight) { v = this.MaxHeight; }
                this.RawGrid[(x * this.SizeX) + y] = v;
            }
        }
    }
    public AddValueAt(x: number, y: number, v: number) {
        if (x >= 0 && x < this.SizeX) {
            if (y >= 0 && y < this.SizeY) {
                this.RawGrid[(x * this.SizeX) + y] += v;
                if (this.RawGrid[(x * this.SizeX) + y] > this.MaxHeight) { this.RawGrid[(x * this.SizeX) + y] = this.MaxHeight; }
            }
        }
    }
    public GetMean() {
        var avr = 0;
        for (var i = 0; i < this.SizeX * this.SizeY; ++i) {
            avr += this.RawGrid[i];
        }
        avr /= this.SizeX * this.SizeY;
        this.Averadge = avr;
        return avr;
    }
};
console.log("Grid defined");
class World {
    public Canvas : HTMLCanvasElement;
    public ctx: CanvasRenderingContext2D;
    public PickedUpSand = 0;
    public WorldSize = 100;
    public GridToCanvas = 5;
    ///
    public UpdatePerTick = 2;
    public FlowPerTick = 0.5;
    public SiltPerTickDirect = 0.1;
    public SiltPerTickIndirect = 1;
    public SiltPoint = 0;
    public SiltPerVolume = 100;
    public Inflow = 10;
    public OutFlow = 10;
    ////
    public WaterHeight = new Grid(this.WorldSize, this.WorldSize);
    public WorldType = new Grid(this.WorldSize, this.WorldSize);//0 = sand,1 = Obstruction, 2 is 'Source', 3 is 'Sink'
    public WaterHeightBuffer = new Grid(this.WorldSize, this.WorldSize);
    public GroundHeight = new Grid(this.WorldSize, this.WorldSize, 1);
    public GroundHeightBuffer = new Grid(this.WorldSize, this.WorldSize, 1);
    public VelocityMapX = new Grid(this.WorldSize, this.WorldSize);
    public VelocityMapY = new Grid(this.WorldSize, this.WorldSize);
    public SiltMap = new Grid(this.WorldSize, this.WorldSize);
    public SiltMapBuffer = new Grid(this.WorldSize, this.WorldSize);
    constructor() {
        this.Canvas = <HTMLCanvasElement> document.getElementById("RenderCanvas");
        this.ctx = <CanvasRenderingContext2D> this.Canvas.getContext("2d");
        this.WaterHeight.MaxHeight = 100;
        this.WaterHeightBuffer.MaxHeight = this.WaterHeight.MaxHeight;
        this.SiltMap.MaxHeight = this.SiltPerVolume * this.WaterHeight.MaxHeight;
        this.SiltMapBuffer.MaxHeight = this.SiltMap.MaxHeight;
        this.WorldGen();
        //this.WaterHeight.SetValueAt(0, 0, 1000);
        //this.GroundHeight.GetMean();
    }
    public WorldGen() {
        for (var x = 0; x < this.GroundHeight.SizeX; ++x) {
            for (var y = 0; y < this.GroundHeight.SizeY; ++y) {
                var Slope = (2 - ((x / this.WorldSize) + (y / this.WorldSize))) * this.GroundHeight.MaxHeight/2;
                this.GroundHeight.SetValueAt(x, y, Slope + (Math.random() * 5));
            }
        }
        this.WorldType.SetValueAt(0, 0, 2);
        this.WorldType.SetValueAt(this.WorldSize, this.WorldSize, 3);
    }
    public UpdateWater() {
        this.VelocityMapX.SetValueAt(x, y, 0);
        this.VelocityMapY.SetValueAt(x, y, 0);
        for (var x = 0; x < this.WaterHeight.SizeX; ++x) {
            for (var y = 0; y < this.WaterHeight.SizeY; ++y) {
                //Simulate :
                //Work out heighest ajoining 
                //var TotalHeight = this.WaterHeight.GetValueAt(x, y) + this.GroundHeight.GetValueAt(x, y);
                var SearchSpace = [[1, 0], [0, 1], [-1, 0], [0, -1]];
                var AjoiningCellHeights = [];
                for (var i = 0; i < SearchSpace.length; ++i) {
                    var offset = SearchSpace[i];
                    var value = (this.WaterHeight.GetValueAt(x - offset[0], y - offset[1]) + this.GroundHeight.GetValueAt(x - offset[0], y - offset[1]));
                    if (x - offset[0] < 0 || y - offset[1] < 0) { value = null; }
                    if (x - offset[0] > this.WaterHeight.SizeX || y - offset[1] > this.WaterHeight.SizeY) { value = null; }
                    //if (value < 0) { value = 0; }
                    if(x - offset[0] == 0 && y - offset[1] == 2) {
                        var alert = true;
                    }
                    AjoiningCellHeights.push([x - offset[0], y - offset[1], value]);
                }
                for (var i = 0; i < AjoiningCellHeights.length ; ++i) {
                    for (var j = 0; j < AjoiningCellHeights.length - 1; ++j) {
                        if (AjoiningCellHeights[j][2] != null) {
                            if (AjoiningCellHeights[j][2] < AjoiningCellHeights[j + 1][2] || AjoiningCellHeights[j + 1][2] == null) {
                                var temp = AjoiningCellHeights[j];
                                AjoiningCellHeights[j] = AjoiningCellHeights[j + 1];
                                AjoiningCellHeights[j + 1] = temp;
                            }
                        }
                    }
                }
                var Outflowpaths = 4;
                var TakenFlow = 0;
                var TakenSilt = 0;
                var WaterHeightCurrent = this.WaterHeight.GetValueAt(x, y);
                var GroundHeightCurrent = this.GroundHeight.GetValueAt(x, y);
                for (var i = 0; i < AjoiningCellHeights.length;++i)
                {
                    if (AjoiningCellHeights[i][2] == null) {
                        --Outflowpaths;
                        continue;
                    }
                    if (AjoiningCellHeights[i][2] - GroundHeightCurrent < WaterHeightCurrent - TakenFlow && WaterHeightCurrent - TakenFlow > 0) {
                        //Flow Water Out
                        var TakenHeight = AjoiningCellHeights[i][2] - GroundHeightCurrent;
                        var Flow = ((WaterHeightCurrent - TakenFlow) - TakenHeight) * this.FlowPerTick;
                        var Siltflow = this.SiltMap.GetValueAt(x, y) * (Flow / this.WaterHeight.GetValueAt(x, y)) * 0.5;
                        TakenFlow += Flow;
                        TakenSilt += Siltflow;
                        Flow /= Outflowpaths;
                        for (var j = i; j < AjoiningCellHeights.length; ++j) {
                            this.WaterHeightBuffer.AddValueAt(AjoiningCellHeights[j][0], AjoiningCellHeights[j][1], Flow);
                            this.SiltMapBuffer.AddValueAt(AjoiningCellHeights[j][0], AjoiningCellHeights[j][1],Siltflow);
                            this.VelocityMapX.AddValueAt(x, y, Siltflow * (AjoiningCellHeights[j][0] - x));
                            this.VelocityMapY.AddValueAt(x, y, Siltflow * (AjoiningCellHeights[j][1] - y));
                        }
                    }
                    --Outflowpaths;
                }
                this.WaterHeightBuffer.AddValueAt(x, y, WaterHeightCurrent - TakenFlow);
                this.SiltMapBuffer.AddValueAt(x, y, this.SiltMap.GetValueAt(x,y) - TakenSilt);
                //this.VelocityMapX.AddValueAt(x, y, TakenFlow);
                if (this.WorldType.GetValueAt(x, y) == 2) {
                    this.WaterHeightBuffer.AddValueAt(x, y, this.Inflow);
                }
                if (this.WorldType.GetValueAt(x, y) == 3) {
                    this.WaterHeightBuffer.AddValueAt(x, y, -this.OutFlow);
                }
            }
        }
        for (var x = 0; x < this.WaterHeight.SizeX; ++x) {
            for (var y = 0; y < this.WaterHeight.SizeY; ++y) {
                if (this.WaterHeightBuffer.GetValueAt(x, y) < 0.01) {
                    this.WaterHeightBuffer.SetValueAt(x, y, 0);
                }
            }
        }
        this.WaterHeight = this.WaterHeightBuffer;
        this.WaterHeightBuffer = new Grid(this.WorldSize, this.WorldSize);
        this.WaterHeightBuffer.MaxHeight = this.WaterHeight.MaxHeight;
        //this.SiltMap = this.SiltMapBuffer;
        //this.SiltMapBuffer = new Grid(this.WorldSize, this.WorldSize);
        //this.SiltMapBuffer.MaxHeight = this.SiltMap.MaxHeight;
    }
    DirectSilting(x, y) {
        //Direct of the floor
        var InverseWater = 1 / this.WaterHeight.GetValueAt(x, y);
        //Erosion
        var SiltCapacity = this.SiltPerVolume * this.WaterHeight.GetValueAt(x, y);
        var SiltPercent = 1 - (this.SiltMap.GetValueAt(x, y) / SiltCapacity);
        //console.log(this.VelocityMap.GetValueAt(x, y) + " Speed");
        var VX = this.VelocityMapX.GetValueAt(x, y);
        var VY = this.VelocityMapY.GetValueAt(x, y);
        var Speed = Math.sqrt((VX * VX) + (VY * VY)) - this.SiltPoint;
        var SandMoved = SiltPercent * Speed * this.SiltPerTickDirect * InverseWater;
        //console.log(SandMoved);
        if (this.GroundHeight.GetValueAt(x, y) - SandMoved < 0) {
            SandMoved = this.GroundHeight.GetValueAt(x, y);
        }
        if (this.SiltMap.GetValueAt(x, y) + SandMoved < 0) {
            SandMoved = this.SiltMap.GetValueAt(x, y);
        }
        if (this.GroundHeight.GetValueAt(x, y) - SandMoved > this.GroundHeight.MaxHeight) {
            SandMoved = SandMoved - this.GroundHeight.MaxHeight;
        }
        if (this.SiltMap.GetValueAt(x, y) + SandMoved > this.SiltMap.MaxHeight) {
            SandMoved = SandMoved - this.SiltMap.MaxHeight;
        }
        this.GroundHeight.AddValueAt(x, y, -SandMoved);
        this.SiltMap.AddValueAt(x, y, SandMoved);
    }
    Sign(x) {
        if (x == 0) { return 0;}
        return x / Math.abs(x);
    }
    IndirectSilting(x, y) {
        //Flow next to sand should pile up silt in water onto it (slow), and flow next to sand should take it away(fast)
        var SearchSpace = [[1, 0], [0, 1], [-1, 0], [0, -1]];
        var AjoiningCellHeights = [];
        var InverseWater = 1 / this.WaterHeight.GetValueAt(x, y);
        //Erosion
        var SiltCapacity = this.SiltPerVolume * this.WaterHeight.GetValueAt(x, y);
        var VX = this.VelocityMapX.GetValueAt(x, y);
        var VY = this.VelocityMapY.GetValueAt(x, y);
        var Speed = Math.sqrt((VX * VX) + (VY * VY)) - this.SiltPoint;
        for (var i = 0; i < SearchSpace.length; ++i) {
            var offset = SearchSpace[i];
            var X = x - offset[0];
            var Y = y - offset[1];
            if (X < 0 || Y - offset[1] < 0) { continue; }
            if (X > this.WaterHeight.SizeX || Y > this.WaterHeight.SizeY) { continue; }
            if (this.GroundHeight.GetValueAt(X, Y) > this.GroundHeight.GetValueAt(x, y)) {// && this.Sign(VX) != -offset[0] && this.Sign(VY) != -offset[1]) {
                var SiltPercent = 1 - (this.SiltMap.GetValueAt(x, y) / SiltCapacity);
                var HeightDiff = this.GroundHeight.GetValueAt(X, Y) - this.GroundHeight.GetValueAt(x, y);
                var SandMoved = SiltPercent * Speed * this.SiltPerTickIndirect * InverseWater * 0.25 * (-HeightDiff);
                if (this.GroundHeight.GetValueAt(X, Y) - SandMoved < 0) {
                    SandMoved = this.GroundHeight.GetValueAt(X, Y);
                }
                if (this.SiltMap.GetValueAt(x, y) + SandMoved < 0) {
                    SandMoved = this.SiltMap.GetValueAt(x, y);
                }
                if (this.GroundHeight.GetValueAt(X, Y) - SandMoved > this.GroundHeight.MaxHeight) {
                    SandMoved = SandMoved - this.GroundHeight.MaxHeight;
                }
                if (this.SiltMap.GetValueAt(x, y) + SandMoved > this.SiltMap.MaxHeight) {
                    SandMoved = SandMoved - this.SiltMap.MaxHeight;
                }
                this.GroundHeight.AddValueAt(X, Y, -SandMoved);
                this.SiltMap.AddValueAt(x, y, SandMoved);
            }
        }
    }
    UpdateSilting() {
        for (var x = 0; x < this.SiltMap.SizeX; ++x) {
            for (var y = 0; y < this.SiltMap.SizeY; ++y) {
                if (this.WaterHeight.GetValueAt(x, y) > 0) {
                    this.DirectSilting(x, y);
                    this.IndirectSilting(x, y);
                    if (this.SiltMap.GetValueAt(x, y) < 0.01) {
                        this.SiltMap.SetValueAt(x, y, 0);
                    }
                }
            }
        }
    }
    Erosion() {
        for (var x = 0; x < this.GroundHeight.SizeX; ++x) {
            for (var y = 0; y < this.GroundHeight.SizeY; ++y) {
                if (this.WaterHeight.GetValueAt(x, y) > 0) {
                    var SearchSpace = [[1, 0], [0, 1], [-1, 0], [0, -1]];
                    var AjoiningCellHeights = [];
                    for (var i = 0; i < SearchSpace.length; ++i) {
                        var offset = SearchSpace[i];
                        var value = this.GroundHeight.GetValueAt(x - offset[0], y - offset[1]);
                        if (x - offset[0] < 0 || y - offset[1] < 0) { value = null; }
                        if (x - offset[0] > this.GroundHeight.SizeX || y - offset[1] > this.GroundHeight.SizeY) { value = null; }
                        AjoiningCellHeights.push([x - offset[0], y - offset[1], value]);
                    }
                    for (var i = 0; i < AjoiningCellHeights.length; ++i) {
                        for (var j = 0; j < AjoiningCellHeights.length - 1; ++j) {
                            if (AjoiningCellHeights[j][2] != null) {
                                if (AjoiningCellHeights[j][2] < AjoiningCellHeights[j + 1][2] || AjoiningCellHeights[j + 1][2] == null) {
                                    var temp = AjoiningCellHeights[j];
                                    AjoiningCellHeights[j] = AjoiningCellHeights[j + 1];
                                    AjoiningCellHeights[j + 1] = temp;
                                }
                            }
                        }
                    }
                    var Outflowpaths = 4;
                    var TakenFlow = 0;
                    var GroundHeightCurrent = this.GroundHeight.GetValueAt(x, y);
                    for (var i = 0; i < AjoiningCellHeights.length; ++i) {
                        if (AjoiningCellHeights[i][2] == null) {
                            continue;
                        }
                        if (AjoiningCellHeights[i][2] > GroundHeightCurrent && this.WaterHeight.GetValueAt(x, y) > 0) {
                            //Flow Water Out
                            var HeightDiff = AjoiningCellHeights[i][2] - GroundHeightCurrent;
                            var VX = this.VelocityMapX.GetValueAt(x, y);
                            var VY = this.VelocityMapY.GetValueAt(x, y);
                            var Speed = Math.sqrt((VX * VX) + (VY * VY));
                            if (this.Sign(VX) == -offset[0] && this.Sign(VY) == -offset[1]) {
                                Speed *= 100;
                            }
                            var Flow = this.SiltPerTickIndirect * HeightDiff * Speed * this.WaterHeight.GetValueAt(x,y);
                            this.GroundHeightBuffer.AddValueAt(AjoiningCellHeights[i][0], AjoiningCellHeights[i][1], -Flow);
                        }
                    }
                    this.GroundHeightBuffer.AddValueAt(x, y, GroundHeightCurrent - this.SiltPerTickDirect);
                }
                else {
                    this.GroundHeightBuffer.AddValueAt(x, y, this.GroundHeight.GetValueAt(x, y));
                }
                if (this.GroundHeightBuffer.GetValueAt(x, y) < 0) {
                    this.GroundHeightBuffer.SetValueAt(x, y, 0);
                }
            }
        }
        this.GroundHeight = this.GroundHeightBuffer;
        this.GroundHeightBuffer = new Grid(this.WorldSize,this.WorldSize);
        this.GroundHeightBuffer.MaxHeight = this.GroundHeight.MaxHeight;
    }
    Update() {
        for (var i = 0; i < this.UpdatePerTick; ++i) {
            this.UpdateWater();
            this.Erosion();
            //this.UpdateShuffle();
            //this.UpdateSilting();
        }
    }
    Render() {
        //this.ctx.clearRect(0, 0, this.Canvas.width, this.Canvas.height);
        for (var x = 0; x < this.GroundHeight.SizeX; ++x) {
            for (var y = 0; y < this.GroundHeight.SizeY; ++y) {
                //FFC877 Sand brightest.
                var BrightnessDec = Math.max(0.1,this.GroundHeight.GetValueAt(x,y) / (this.GroundHeight.MaxHeight));
                var R = 255 * BrightnessDec;
                var G = 200 * BrightnessDec;
                var B = 119 * BrightnessDec;
                if (this.WaterHeight.GetValueAt(x, y) > 0) {
                    //00D4FF Water
                    var BrightnessDecWater = 1 - (this.WaterHeight.GetValueAt(x, y) / (0.5 * this.WaterHeight.MaxHeight));
                    //BrightnessDecWater = Math.max(0, Math.min(1, BrightnessDecWater))
                    R /= 2;
                    G += 212 * BrightnessDecWater;
                    G /= Math.max(2,Math.ceil(G / 255));
                    B += 255;// * BrightnessDecWater;
                    B /= Math.max(2, Math.ceil(G / 255));
                }
                var fillR = Math.round(R).toString(16);
                if (fillR.length == 1) { fillR = "0" + fillR; }
                var fillG = Math.round(G).toString(16);
                if (fillG.length == 1) { fillG = "0" + fillG; }
                var fillB = Math.round(B).toString(16);
                if (fillB.length == 1) { fillB = "0" + fillB; }
                this.ctx.fillStyle = "#" + fillR + fillG + fillB;
                this.ctx.fillRect(x * this.GridToCanvas, y * this.GridToCanvas, this.GridToCanvas, this.GridToCanvas);
            }
        }
        return;
    }
    PollInput() {
        var DeltaHeight = 0;
        var HeightPerSecond = 10;
        //if (Button == 0) { DeltaHeight = HeightPerSecond; }
        //if (Button == 2) { DeltaHeight = HeightPerSecond; }
        if (Button == 1) { //DeltaHeight = -HeightPerSecond; }
            document.getElementById("out").innerHTML = this.WaterHeight.GetValueAt(MouseChunkX, MouseChunkY).toString() + ":Water ," + this.GroundHeight.GetValueAt(MouseChunkX, MouseChunkY) + ":Ground," + (this.SiltMap.GetValueAt(MouseChunkX, MouseChunkY)/(this.SiltPerVolume*this.WaterHeight.GetValueAt(MouseChunkX,MouseChunkY))) + "%:Silts";
            //console.log(this.WaterHeight.GetValueAt(MouseChunkX, MouseChunkY));
        }
        var Direction = 0;
        if (Button == 0) {
            Direction = 1;
        }
        if (Button == 2) {
            Direction = -1;
        }
        if (Direction != 0) {
            this.ManipulateSand(MouseChunkX, MouseChunkY, 10, Direction,3000);
        }
        //Button = -1;
    }
    public DistributionFunction(x, y) {
        return Math.abs(x) + Math.abs(y);
    }
    public ManipulateSand(ChunkX, ChunkY, Size, Direction,factor) {
        var SizeOffset = Size / 2;
        var Area = 0;
        var Factor = factor;
        var Min = this.DistributionFunction(-SizeOffset,-SizeOffset);
        for (var xo = 0; xo < Size; ++xo) {
            var X = MouseChunkX - (xo - SizeOffset);
            if (X < 0) { continue; }
            if (X > this.WorldSize) { continue; }
            for (var yo = 0; yo < Size; ++yo) {
                var Y = MouseChunkY - (yo - SizeOffset);
                if (Y < 0) { continue; }
                if (Y > this.WorldSize) { continue; }
                Area += this.DistributionFunction(X, Y) + Min;
            }
        }
        if (Factor * Area * Direction > this.PickedUpSand)
        {
            Factor *= (this.PickedUpSand / Area);
        }
        for (var xo = 0; xo < Size; ++xo) {
            var X = MouseChunkX - (xo - SizeOffset);
            if (X < 0) { continue; }
            if (X > this.WorldSize) { continue; }
            for (var yo = 0; yo < Size; ++yo) {
                var Y = MouseChunkY - (yo - SizeOffset);
                if (Y < 0) { continue; }
                if (Y > this.WorldSize) { continue; }
                //Simulate
                var Distribution = this.DistributionFunction(xo - SizeOffset,yo - SizeOffset) + Min;
                Distribution = (Direction * Distribution*Factor) / (Area);
                //Distribution *= Direrction;

                if (this.GroundHeight.GetValueAt(X, Y) + Distribution > this.GroundHeight.MaxHeight) {
                    Distribution = this.GroundHeight.MaxHeight - this.GroundHeight.GetValueAt(X, Y);
                } if (this.GroundHeight.GetValueAt(X, Y) + Distribution < 0) {
                        Distribution = - this.GroundHeight.GetValueAt(X, Y);
                }
                this.GroundHeight.AddValueAt(X, Y,Distribution);
                this.PickedUpSand -= Distribution;
            }
        }
    }
    public MainLoop() {
        //if (this.ToUpdate) { this.Update(); this.ToUpdate = false; } else { this.ToUpdate = true; }
        this.PollInput();
        this.Render();
        this.Update();
        //return;
    }
};
var MouseChunkX = 0;
var MouseChunkY = 0;
var Button = -1;
console.log("world defined");
var world = new World();
var Interval = 0;
world.Canvas.onmousemove = function (event: MouseEvent) {
    MouseChunkX = Math.floor((event.pageX - world.Canvas.offsetLeft) / world.GridToCanvas);
    MouseChunkY = Math.floor((event.pageY - world.Canvas.offsetTop) / world.GridToCanvas);
};
world.Canvas.onmousedown = function (event: MouseEvent) {
    Button = event.button;
    return true;
};
world.Canvas.onmouseup = function (event: MouseEvent) {
    Button = -1;
    return true;
};
var UpdateSpeed = 10;
document.getElementById("ResetButton").onclick = function (event: MouseEvent) {
    //alert("dsada");
    clearInterval(Interval);
    world = new World();
    Interval = setInterval(function () { world.MainLoop(); }, UpdateSpeed);
    return true;
};
//world.MainLoop();
Interval = setInterval(function () { world.MainLoop(); }, UpdateSpeed);
};