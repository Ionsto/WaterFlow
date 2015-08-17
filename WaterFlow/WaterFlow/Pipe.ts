module Pipe {
    class Grid {
        public SizeX = 100;
        public SizeY = 100;
        public SizeTotal = this.SizeX * this.SizeY;
        RawGrid: Int32Array;
        MaxHeight = 50;
        Averadge = 0;
        constructor(x: number, y: number, d = 0) {
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
                    if (this.RawGrid[(x * this.SizeX) + y] > this.MaxHeight && this.MaxHeight != -1) { this.RawGrid[(x * this.SizeX) + y] = this.MaxHeight; }
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
    class Element {
        public Active = true;
        public Update(gui: Gui) { }
        public Render(gui: Gui) { }
    }
    class Button extends Element {
        public X = 0;
        public Y = 0;
        public SizeX = 0;
        public SizeY = 0;
        public Text: Lable;
        public State = 0;
        constructor(x, y, sx, sy, txt,fsize= 30) {
            super();
            this.X = x;
            this.Y = y;
            this.SizeX = sx;
            this.SizeY = sy;
            this.Text = new Lable(x + sx/2, y + sy/2, txt,fsize);
        }
        public Render(gui: Gui) {
            if (this.State == 0) {
                gui.ctx.fillStyle = "#FF00FF";
            } else if (this.State == 1) {
                gui.ctx.fillStyle = "#CC00FF";
            } else if (this.State == 2) {
                gui.ctx.fillStyle = "#FF55FF";
            }
            gui.ctx.fillRect(this.X, this.Y, this.SizeX, this.SizeY);
            gui.ctx.fillStyle = "#000000";
            this.Text.Render(gui);
        }
        public Update(gui: Gui) {
            if (gui.Button == 0) {
                if (gui.MouseX > this.X && gui.MouseX < this.X + this.SizeX) {
                    if (gui.MouseY > this.Y && gui.MouseY < this.Y + this.SizeY) {
                        if (this.State == 0) {
                            this.State = 1;
                        }
                    }
                }
            }
            else {
                if (this.State == 1) {
                    this.State = 2;
                }
                else {
                    this.State = 0;
                }
            }
        }
    }
    class Lable extends Element {
        public X = 0;
        public Y = 0;
        public Text = "";
        public FontSize = 30;
        constructor(x, y, txt,size=30) {
            super();
            this.X = x;
            this.Y = y;
            this.Text = txt;
            this.FontSize = size;
        }
        public Render(gui: Gui) {
            gui.ctx.font = this.FontSize.toString() + "px Arial";
            gui.ctx.fillText(this.Text, this.X - ((this.Text.length - 1) * (this.FontSize / 4)), this.Y + (this.FontSize * 0.5 / 2));
        }
    }
    class Gui {
        public MouseX = 0;
        public MouseY = 0;
        public Button = -1;
        public Width = 0;
        public Height = 0;
        public Active = false;
        public Elements: Array<Element> = [];
        public ctx: CanvasRenderingContext2D;
        constructor(ctx, width, height) {
            this.ctx = ctx;
            this.Width = width;
            this.Height = height;
        }
        Update(mx, my, b) {
            this.MouseX = mx;
            this.MouseY = my;
            this.Button = b;
            for (var i = 0; i < this.Elements.length; ++i) {
                if (this.Elements[i].Active) {
                    this.Elements[i].Update(this);
                }
            }
        }
        Render() {
            for (var i = 0; i < this.Elements.length; ++i) {
                if (this.Elements[i].Active) {
                    this.Elements[i].Render(this);
                }
            }
        }
    }
    console.log("Grid defined");
    class World {
        //game values
        public Canvas: HTMLCanvasElement;
        public ctx: CanvasRenderingContext2D;
        public PickedUpSand = 0;
        public GridToCanvas = 4;
        public GameState = 0;
        public PlaySize = 500;
        public WorldSize = this.PlaySize / this.GridToCanvas;
        public StartTime = 100;
        public Time = 0;
        public HousesRemaining = 5;
        public HighScore = 0;
        public InflowX = 10;
        public InflowY = 10;
        public MainMenu:Gui;
        public Hud: Gui;
        public LoseScreen: Gui;
        ///Sim values
        public DeltaTime = 1;
        public Gravity = 10;
        public PipeLength = 1;
        public PipeCrossSection = 0.01;
        public UpdatePerTick = 2;
        public SedimentDepositingConst = 1;
        public SedimentDissolvingConst = 1;
        public SedimentCapacityConst = 0.01;
        public Inflow = 100;
        public OutFlow = 100;
        public MaxOutFlow = 100;
        public SlumpConst = 0.1;
        public SlumpLimitDry = 10;
        public SlumpLimitWet = 0;
        ////Sim buffers
        public GroundType = new Grid(this.WorldSize, this.WorldSize);//0 = sand,1 = Obstruction, 2 is 'Source', 3 is 'Sink'
        public WaterHeight = new Grid(this.WorldSize, this.WorldSize);
        public WaterHeightBuffer = new Grid(this.WorldSize, this.WorldSize);
        public GroundHeight = new Grid(this.WorldSize, this.WorldSize, 1);
        public GroundHeightBuffer = new Grid(this.WorldSize, this.WorldSize, 1);
        //public InFlowMap: Array<Grid>;
        public OutFlowMap: Array<Grid> = [];
        public VelocityMapX = new Grid(this.WorldSize, this.WorldSize);
        public VelocityMapY = new Grid(this.WorldSize, this.WorldSize);
        public SiltMap = new Grid(this.WorldSize, this.WorldSize);
        public SiltMapBuffer = new Grid(this.WorldSize, this.WorldSize);
        SearchSpace = [[1, 0], [0, 1], [-1, 0], [0, -1]];
        constructor() {
            this.Init();
            this.InitGuis();
        }
        public Init() {
            this.PickedUpSand = 0;
            this.Time = 0;
            this.GroundType = new Grid(this.WorldSize, this.WorldSize);//0 = sand,1 = Obstruction, 2 is 'Source', 3 is 'Sink'
            this.WaterHeight = new Grid(this.WorldSize, this.WorldSize);
            this.WaterHeightBuffer = new Grid(this.WorldSize, this.WorldSize);
            this.GroundHeight = new Grid(this.WorldSize, this.WorldSize, 1);
            this.GroundHeightBuffer = new Grid(this.WorldSize, this.WorldSize, 1);
            this.OutFlowMap = [];
            this.VelocityMapX = new Grid(this.WorldSize, this.WorldSize);
            this.VelocityMapY = new Grid(this.WorldSize, this.WorldSize);
            this.SiltMap = new Grid(this.WorldSize, this.WorldSize);
            this.SiltMapBuffer = new Grid(this.WorldSize, this.WorldSize);
            this.Canvas = <HTMLCanvasElement> document.getElementById("RenderCanvas");
            this.Canvas.width = (this.PlaySize) + 100;
            this.Canvas.height = (this.PlaySize);
            this.ctx = <CanvasRenderingContext2D> this.Canvas.getContext("2d");
            this.WaterHeight.MaxHeight = 200;
            this.WaterHeightBuffer.MaxHeight = this.WaterHeight.MaxHeight;
            this.SiltMap.MaxHeight = 1000;
            this.SiltMapBuffer.MaxHeight = this.SiltMap.MaxHeight;
            for (var i = 0; i < 4; ++i) {
                this.OutFlowMap[i] = new Grid(this.WorldSize, this.WorldSize);
            }
            this.WorldGen();
        }
        InitGuis() {
            this.InitMainMenu();
            this.InitHUD();
        }
        InitMainMenu() {
            this.MainMenu = new Gui(this.ctx, this.PlaySize, this.PlaySize);
            var Start = new Button(this.PlaySize / 2, 100, 100, 50, "Start");
            var Credits = new Button(this.PlaySize / 2, 200, 100, 50, "Credits");
            this.MainMenu.Elements.push(Start);
            this.MainMenu.Elements.push(Credits);
        }
        InitHUD() {
            this.Hud = new Gui(this.ctx, this.PlaySize, this.PlaySize);
            var Restart = new Button(this.PlaySize, 0, 100, 50, "Start",20);
            var Credits = new Button(this.PlaySize, 100, 100, 50, "Credits",20);
            this.Hud.Elements.push(Restart);
            this.Hud.Elements.push(Credits);
        }

        public VallyGen(x, y, SeedX, SeedY) {
            var val = Math.sin((x - y) / SeedX) * SeedY;
            return val;
        }
        public SlopeGen(x, y) {
            return (2 - ((x / this.WorldSize) + (y / this.WorldSize))) * this.GroundHeight.MaxHeight / 2;
        }
        public WorldGen() {
            var SeedX = (Math.random() * 10);
            var SeedY = (Math.random() * 10);
            var XLow = 0;
            var YLow = 0;
            var Low = -1;
            for (var x = 0; x < this.GroundHeight.SizeX; ++x) {
                for (var y = 0; y < this.GroundHeight.SizeY; ++y) {
                    this.GroundHeight.SetValueAt(x, y, this.SlopeGen(x, y) + this.VallyGen(x, y, SeedX,SeedY));
                    if (this.GroundHeight.GetValueAt(x, y) < 0) {
                        this.GroundHeight.SetValueAt(x, y, 0);
                    }
                    if (this.GroundHeight.GetValueAt(x, y) < Low || Low == -1) {
                        XLow = x;
                        YLow = y;
                        Low = this.GroundHeight.GetValueAt(x, y);
                    }
                }
            }
            this.GroundType.SetValueAt(this.InflowX, this.InflowY, 2);
            this.GroundType.SetValueAt(XLow, YLow, 3);
            for (var i = 0; i < this.HousesRemaining; ++i) {
                var x = Math.round(Math.random() * (this.WorldSize - 1));
                var y = Math.round(Math.random() * (this.WorldSize - 1));
                var dis = 20;
                if (Math.abs(this.InflowX - x) > dis && Math.abs(this.InflowY - y) > dis) {
                    this.GroundType.SetValueAt(x, y, 1);
                }
                else {
                    i--;
                }
            }
        }
        public UpdateWorldFlow() {
            for (var x = 0; x < this.GroundType.SizeX; ++x) {
                for (var y = 0; y < this.GroundType.SizeY; ++y) {
                    if (this.GroundType.GetValueAt(x, y) == 2) {
                        var Factor = 100;
                        //var Waves = Math.max(0, (Math.sin((this.Time - this.StartTime) / Factor) * (this.Time - this.StartTime) / (Factor * Math.PI)));
                        //var Waves = Math.max(0,(0.49 * this.Time * Math.sin(this.Time)) + (0.5 * this.Time));
                        var Waves = 0.5 * this.Time;
                        var IFlow = this.DeltaTime * Waves;
                        document.getElementById("Flow").innerHTML = IFlow.toString();
                        this.WaterHeight.AddValueAt(x, y, IFlow);
                        this.SiltMap.AddValueAt(x, y, this.SedimentCapacityConst);
                    }
                    if (this.GroundType.GetValueAt(x, y) == 3) {
                        //this.TotalOutFlow += Math.max(0,this.WaterHeight.GetValueAt(x,y) - this.OutFlow * this.DeltaTime);
                        this.WaterHeight.AddValueAt(x, y, -this.OutFlow * this.DeltaTime);
                    }
                    if (this.GroundType.GetValueAt(x, y) == 1 && this.WaterHeight.GetValueAt(x, y) > 0) {
                        this.GroundType.SetValueAt(x, y, 0);
                        this.HousesRemaining -= 1;
                    }
                    if (this.WaterHeight.GetValueAt(x, y) <= 0.001) {
                        this.WaterHeight.SetValueAt(x, y, 0);
                    }
                }
            }
            if (this.HousesRemaining <= 0) {
                this.GameState = 2;
            }
        }
        public UpdateOutFlow() {
            for (var x = 0; x < this.WaterHeight.SizeX; ++x) {
                for (var y = 0; y < this.WaterHeight.SizeY; ++y) {
                    //Each cell is connected to two others, (down & right)
                    var TotalFlow = 0;
                    for (var i = 0; i < this.SearchSpace.length; ++i) {
                        var Offset = this.SearchSpace[i];
                        if (!(x + Offset[0] < 0 || y + Offset[1] < 0 || x + Offset[0] >= this.WaterHeight.SizeX || y + Offset[1] >= this.WaterHeight.SizeY)) {
                            var HeightDifference = (this.GroundHeight.GetValueAt(x, y) + this.WaterHeight.GetValueAt(x, y)) - (this.GroundHeight.GetValueAt(x + Offset[0], y + Offset[1]) + this.WaterHeight.GetValueAt(x + Offset[0], y + Offset[1]));
                            var Flow = Math.max(0, this.OutFlowMap[i].GetValueAt(x, y) + (this.DeltaTime * this.PipeCrossSection * ((this.Gravity * HeightDifference) / this.PipeLength)));
                            TotalFlow += Flow;
                            this.OutFlowMap[i].SetValueAt(x, y, Flow);
                        }
                    }
                    var WaterHeight = this.WaterHeight.GetValueAt(x, y);
                    if (TotalFlow > this.WaterHeight.GetValueAt(x, y)) {
                        var KScale = Math.min(1, this.WaterHeight.GetValueAt(x, y) / (TotalFlow));
                        for (var i = 0; i < this.SearchSpace.length; ++i) {
                            this.OutFlowMap[i].SetValueAt(x, y, this.OutFlowMap[i].GetValueAt(x, y) * KScale);
                        }
                    }
                }
            }
        }
        public UpdateWater() {
            this.UpdateOutFlow();
            for (var x = 0; x < this.WaterHeight.SizeX; ++x) {
                for (var y = 0; y < this.WaterHeight.SizeY; ++y) {
                    var VolumeIn = 0;
                    var VolumeOut = 0;
                    for (var i = 0; i < this.SearchSpace.length; ++i) {
                        var Offset = this.SearchSpace[i];
                        if (!(x - Offset[0] < 0 || y - Offset[1] < 0 || x - Offset[0] >= this.WaterHeight.SizeX || y - Offset[1] >= this.WaterHeight.SizeY)) {
                            VolumeIn += this.OutFlowMap[i].GetValueAt(x - Offset[0], y - Offset[1]);
                        }
                        VolumeOut += this.OutFlowMap[i].GetValueAt(x,y);
                    }
                    var VolumeNet = this.DeltaTime * (VolumeIn - VolumeOut);
                    this.WaterHeightBuffer.SetValueAt(x, y, this.WaterHeight.GetValueAt(x, y) + VolumeNet);
                }
            }
            this.WaterHeight = this.WaterHeightBuffer;
            this.WaterHeightBuffer = new Grid(this.WorldSize, this.WorldSize);
            this.WaterHeightBuffer.MaxHeight = this.WaterHeight.MaxHeight;
        }
        Sign(x) {
            if (x == 0) { return 0; }
            return x / Math.abs(x);
        }
        UpdateSiltTransport() {
            for (var x = 0; x < this.SiltMap.SizeX; ++x) {
                for (var y = 0; y < this.SiltMap.SizeY; ++y) {
                    if (this.WaterHeight.GetValueAt(x, y) > 0) {
                        var OffsetX = this.Sign(this.VelocityMapX.GetValueAt(x, y) * this.DeltaTime);
                        var OffsetY = this.Sign(this.VelocityMapY.GetValueAt(x, y) * this.DeltaTime);
                        if (x - OffsetX < 0 || y - OffsetY < 0 || x - OffsetX >= this.WaterHeight.SizeX || y - OffsetY >= this.WaterHeight.SizeY) {
                            //exception
                            this.SiltMapBuffer.SetValueAt(x, y, this.SiltMap.GetValueAt(x, y));
                        }
                        else
                        {
                            this.SiltMapBuffer.SetValueAt(x, y, this.SiltMap.GetValueAt(x - OffsetX, y - OffsetY));
                        }
                    }
                }
            }
            //Flip Silt buffer
            this.SiltMap = this.SiltMapBuffer;
            this.SiltMapBuffer = new Grid(this.WorldSize, this.WorldSize);
            this.SiltMapBuffer.MaxHeight = this.SiltMap.MaxHeight;
        }
        GetTilt(x, y): number {
            var DX = 0;
            var DY = 0;
            var count = 0;
            for (var i = -1; i < 1; ++i) {
                if (!(x + i < 0 || y < 0 || x + i > this.GroundHeight.SizeX || y > this.GroundHeight.SizeY)) {
                    if (!(x + i + 1 < 0 || y < 0 || x + i + 1 > this.GroundHeight.SizeX || y > this.GroundHeight.SizeY)) {
                        DX += this.GroundHeight.GetValueAt(x + i, y) - this.GroundHeight.GetValueAt(x + i + 1, y);
                        ++count;
                    }
                }
            }
            DX /= count;
            count = 0;
            for (var i = -1; i < 1; ++i) {
                if (!(x < 0 || y + i < 0 || x > this.GroundHeight.SizeX || y + i > this.GroundHeight.SizeY)) {
                    if (!(x < 0 || y + i + 1 < 0 || x > this.GroundHeight.SizeX || y + i + 1 > this.GroundHeight.SizeY)) {
                        DY += this.GroundHeight.GetValueAt(x, y + i) - this.GroundHeight.GetValueAt(x, y + i + 1);
                        ++count;
                    }
                }
            }
            DY /= count;
            var theta = Math.atan(DX) + Math.atan(DY);
            //avradge tilt
            return theta / 2;
        }
        UpdateSilting() {
            for (var x = 0; x < this.GroundHeight.SizeX; ++x) {
                for (var y = 0; y < this.GroundHeight.SizeY; ++y) {
                    var VX = this.VelocityMapX.GetValueAt(x, y);
                    var VY = this.VelocityMapY.GetValueAt(x, y);
                    var Speed = Math.sqrt((VX * VX) + (VY * VY));
                    var Silt = this.SiltMap.GetValueAt(x, y);
                    var Capacity = this.SedimentCapacityConst * Speed * Math.sin(this.GetTilt(x, y));
                    if (Capacity > Silt) {
                        var ChangeSilt = this.SedimentDissolvingConst * (Capacity - Silt);
                        if (this.GroundHeight.GetValueAt(x, y) - ChangeSilt < 0) {
                            ChangeSilt = this.GroundHeight.GetValueAt(x, y);
                        }
                        this.GroundHeightBuffer.SetValueAt(x, y, this.GroundHeight.GetValueAt(x, y) - ChangeSilt);
                        this.SiltMapBuffer.SetValueAt(x, y, Silt + ChangeSilt);
                    }
                    else if (Capacity <= this.SiltMap.GetValueAt(x, y)) {
                        var ChangeSilt = this.SedimentDepositingConst * (Silt - Capacity);
                        if (this.SiltMap.GetValueAt(x, y) - ChangeSilt < 0) {
                            ChangeSilt = this.SiltMap.GetValueAt(x, y);
                        }
                        this.GroundHeightBuffer.SetValueAt(x, y, this.GroundHeight.GetValueAt(x, y) + ChangeSilt);
                        this.SiltMapBuffer.SetValueAt(x, y, Silt - ChangeSilt);
                    }
                }
            }
            this.GroundHeight = this.GroundHeightBuffer;
            this.GroundHeightBuffer = new Grid(this.WorldSize, this.WorldSize);
            this.GroundHeightBuffer.MaxHeight = this.GroundHeight.MaxHeight;
            this.SiltMap = this.SiltMapBuffer;
            this.SiltMapBuffer = new Grid(this.WorldSize, this.WorldSize);
            this.SiltMapBuffer.MaxHeight = this.SiltMap.MaxHeight;
        }
        UpdateVelocity() {
            for (var x = 0; x < this.GroundHeight.SizeX; ++x) {
                for (var y = 0; y < this.GroundHeight.SizeY; ++y) {
                    var VX = 0;
                    var VY = 0;
                    for (var i = 0; i < this.SearchSpace.length; i += 2) {
                        var Offset = this.SearchSpace[i];
                        if (!(x - Offset[0] < 0 || y - Offset[1] < 0 || x - Offset[0] >= this.WaterHeight.SizeX || y - Offset[1] >= this.WaterHeight.SizeY)) {
                            VX += this.OutFlowMap[i].GetValueAt(x - Offset[0], y - Offset[1]);
                        }
                        VX -= this.OutFlowMap[i].GetValueAt(x, y);
                    }
                    for (var i = 1; i < this.SearchSpace.length; i += 2) {
                        var Offset = this.SearchSpace[i];
                        if (!(x - Offset[0] < 0 || y - Offset[1] < 0 || x - Offset[0] >= this.WaterHeight.SizeX || y - Offset[1] >= this.WaterHeight.SizeY)) {
                            VY += this.OutFlowMap[i].GetValueAt(x - Offset[0], y - Offset[1]);
                        }
                        VY -= this.OutFlowMap[i].GetValueAt(x, y);
                    }
                    this.VelocityMapX.SetValueAt(x, y, VX);
                    this.VelocityMapY.SetValueAt(x, y, VY);
                }
            }
        }
        public UpdateSandSlumping() {
            for (var x = 0; x < this.GroundHeight.SizeX; ++x) {
                for (var y = 0; y < this.GroundHeight.SizeY; ++y) {
                    var NetVolume = 0
                    for (var i = 0; i < this.SearchSpace.length; ++i) {
                        var VolumeOut = 0;
                        var Offset = this.SearchSpace[i];
                        if (!(x - Offset[0] < 0 || y - Offset[1] < 0 || x - Offset[0] >= this.GroundHeight.SizeX || y - Offset[1] >= this.GroundHeight.SizeY)) {
                            var Lim = this.SlumpLimitDry;
                            if (this.WaterHeight.GetValueAt(x - Offset[0], y - Offset[1]) > 0) { Lim = this.SlumpLimitWet; }
                            var HeightDiff = this.GroundHeight.GetValueAt(x, y) - this.GroundHeight.GetValueAt(x - Offset[0], y - Offset[1]);
                            if (HeightDiff > Lim) {
                                VolumeOut = HeightDiff * this.SlumpConst * this.DeltaTime;
                                NetVolume += VolumeOut;
                            }
                        }
                        if (this.GroundHeightBuffer.GetValueAt(x - Offset[0], y - Offset[1]) + VolumeOut < 0) { VolumeOut = this.GroundHeightBuffer.GetValueAt(x - Offset[0], y - Offset[1]); }
                        this.GroundHeightBuffer.AddValueAt(x - Offset[0], y - Offset[1], VolumeOut);
                    }
                    this.GroundHeightBuffer.SetValueAt(x, y, this.GroundHeight.GetValueAt(x, y) - NetVolume);
                    if (this.GroundHeightBuffer.GetValueAt(x, y) <= 0) {
                        this.GroundHeightBuffer.SetValueAt(x, y, 0);
                    }
                }
            }
            this.GroundHeight = this.GroundHeightBuffer;
            this.GroundHeightBuffer = new Grid(this.WorldSize, this.WorldSize);
            this.GroundHeightBuffer.MaxHeight = this.GroundHeight.MaxHeight;
        }
        Update() {
            for (var i = 0; i < this.UpdatePerTick; ++i) {
                if (this.Time++ >= this.StartTime) { this.UpdateWorldFlow(); }
                this.UpdateWater();
                this.UpdateVelocity();
                this.UpdateSilting();
                this.UpdateSiltTransport();
                this.UpdateSandSlumping();
            }
            //this.Inflow += 1;
        }
        Render() {
            //this.ctx.clearRect(0, 0, this.Canvas.width, this.Canvas.height);
            for (var x = 0; x < this.GroundHeight.SizeX; ++x) {
                for (var y = 0; y < this.GroundHeight.SizeY; ++y) {
                    //FFC877 Sand brightest.
                    var BrightnessDec = Math.max(0.1, this.GroundHeight.GetValueAt(x, y) / (this.GroundHeight.MaxHeight));
                    var R = 255 * BrightnessDec;
                    var G = 200 * BrightnessDec;
                    var B = 119 * BrightnessDec;
                    if (this.WaterHeight.GetValueAt(x, y) > 0) {
                        //00D4FF Water
                        var BrightnessDecWater = 1 - (this.WaterHeight.GetValueAt(x, y) / (0.5 * this.WaterHeight.MaxHeight));
                        //BrightnessDecWater = Math.max(0, Math.min(1, BrightnessDecWater))
                        R /= 2;
                        G += 212 * BrightnessDecWater;
                        G /= Math.max(2, Math.ceil(G / 255));
                        B += 255;// * BrightnessDecWater;
                        B /= Math.max(2, Math.ceil(G / 255));
                    }
                    var fillR = Math.round(R).toString(16);
                    if (fillR.length == 1) { fillR = "0" + fillR; }
                    var fillG = Math.round(G).toString(16);
                    if (fillG.length == 1) { fillG = "0" + fillG; }
                    var fillB = Math.round(B).toString(16);
                    if (fillB.length == 1) { fillB = "0" + fillB; }
                    if (this.GroundType.GetValueAt(x, y) == 1) {
                        fillR = "00";
                        fillG = "FF";
                        fillB = "00";
                    }
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
            if (MouseButton == 1) { //DeltaHeight = -HeightPerSecond; }
                document.getElementById("out").innerHTML = this.WaterHeight.GetValueAt(MouseChunkX, MouseChunkY).toString() + ":Water ," + this.GroundHeight.GetValueAt(MouseChunkX, MouseChunkY) + ":Ground," + (this.SiltMap.GetValueAt(MouseChunkX, MouseChunkY) / (this.SedimentCapacityConst * this.WaterHeight.GetValueAt(MouseChunkX, MouseChunkY))) + "%:Silts";
                //console.log(this.WaterHeight.GetValueAt(MouseChunkX, MouseChunkY));
            }
            var Direction = 0;
            if (MouseButton == 0) {
                Direction = 1;
            }
            if (MouseButton == 2) {
                Direction = -1;
            }
            if (Direction != 0) {
                this.ManipulateSand(MouseChunkX, MouseChunkY, 10, Direction,100);
            }
            //Button = -1;
        }
        public DistributionFunction(x, y) {
            return -((x * x) + (y * y));
            //return Math.abs(x) + Math.abs(y);
        }
        public ManipulateSand(ChunkX, ChunkY, Size, Direction, factor) {
            var SizeOffset = Size / 2;
            var Area = 0;
            var Factor = factor;
            var Min = -this.DistributionFunction(-SizeOffset, 0);
            for (var xo = 0; xo < Size; ++xo) {
                var X = MouseChunkX - (xo - SizeOffset);
                if (X < 0) { continue; }
                if (X > this.WorldSize) { continue; }
                if (X > this.WorldSize) { continue; }
                for (var yo = 0; yo < Size; ++yo) {
                    var Y = MouseChunkY - (yo - SizeOffset);
                    if (Y < 0) { continue; }
                    if (Y > this.WorldSize) { continue; }
                    if (this.DistributionFunction(xo - SizeOffset, yo - SizeOffset) + Min < 0) { continue; }
                    if (this.GroundType.GetValueAt(xo - SizeOffset, yo - SizeOffset) == 1) { continue; }
                    Area += this.DistributionFunction(xo - SizeOffset, yo - SizeOffset) + Min;
                }
            }
            if (Factor * Area * Direction > this.PickedUpSand) {
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
                    if (this.DistributionFunction(xo - SizeOffset, yo - SizeOffset) + Min < 0) { continue; }
                    if (this.GroundType.GetValueAt(xo - SizeOffset, yo - SizeOffset) == 1) { continue; }
                    //Simulate
                    var Distribution = this.DistributionFunction(xo - SizeOffset, yo - SizeOffset) + Min;
                    Distribution = (Direction * Distribution * Factor) / (Area);
                    //Distribution *= Direrction;

                    if (this.GroundHeight.GetValueAt(X, Y) + Distribution > this.GroundHeight.MaxHeight) {
                        Distribution = this.GroundHeight.MaxHeight - this.GroundHeight.GetValueAt(X, Y);
                    } if (this.GroundHeight.GetValueAt(X, Y) + Distribution < 0) {
                        Distribution = - this.GroundHeight.GetValueAt(X, Y);
                    }
                    this.GroundHeight.AddValueAt(X, Y, Distribution);
                    this.PickedUpSand -= Distribution;
                }
            }
        }
        public RenderEndScreen() {
            this.ctx.fillStyle = "#00FFFF";
            this.ctx.fillText("Rekt", this.WorldSize / 2, this.Canvas.height / 3);
            this.ctx.fillText(this.Time.toString(), this.Canvas.width / 2, this.Canvas.height*2 / 3);
        }
        public RenderLossMenu() {

        }
        public MainLoop() {
            //if (this.ToUpdate) { this.Update(); this.ToUpdate = false; } else { this.ToUpdate = true; }
            switch(this.GameState)
            {
                case 0:
                    this.MainMenu.Update(MouseX, MouseY, MouseButton);
                    this.MainMenu.Render();
                    if ((<Button>this.MainMenu.Elements[0]).State == 2) {
                        this.GameState = 1;
                    }
                    break;
                case 1:
                    this.PollInput();
                    this.Render();
                    this.Update();
                    this.Hud.Update(MouseX, MouseY, MouseButton);
                    this.Hud.Render();
                    if ((<Button>this.Hud.Elements[0]).State == 2) {
                        this.Init();
                    }
                    break;
                case 2:
                    this.RenderEndScreen();
                    break;
            }
            //return;
        }
    };
    var MouseX = 0;
    var MouseY = 0;
    var MouseChunkX = 0;
    var MouseChunkY = 0;
    var MouseButton = -1;
    console.log("world defined");
    var world = new World();
    var Interval = 0;
    world.Canvas.onmousemove = function (event: MouseEvent) {
        MouseX = event.pageX - world.Canvas.offsetLeft;
        MouseY = event.pageY - world.Canvas.offsetTop;
        MouseChunkX = Math.floor((event.pageX - world.Canvas.offsetLeft) / world.GridToCanvas);
        MouseChunkY = Math.floor((event.pageY - world.Canvas.offsetTop) / world.GridToCanvas);
    };
    world.Canvas.onmousedown = function (event: MouseEvent) {
        MouseButton = event.button;
        return true;
    };
    world.Canvas.onmouseup = function (event: MouseEvent) {
        MouseButton = -1;
        return true;
    };
    var UpdateSpeed = 10;
    document.getElementById("ResetButton").onclick = function (event: MouseEvent) {
        //alert("dsada");
        //clearInterval(Interval);
        //world = new World();
        //Interval = setInterval(function () { world.MainLoop(); }, UpdateSpeed);
        return true;
    };
    //world.MainLoop();
    Interval = setInterval(function () { world.MainLoop(); }, UpdateSpeed);
}