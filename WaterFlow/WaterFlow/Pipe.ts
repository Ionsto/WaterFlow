/*Version 1.3 rel
Bug List:
*/
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
        public Z = 0;
        constructor(z = 0) {
            this.Z = z;
        }
        public Remove(gui:Gui) {}
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
        public Centered = true;
        constructor(gui:Gui,x, y, sx, sy, txt, fsize= 30, c = true,z = 0) {
            super(z);
            this.X = x;
            this.Y = y;
            this.SizeX = sx;
            this.SizeY = sy;
            this.Centered = c;
            var lx = x + sx / 2;
            var ly = y + sy / 2;
            if (!this.Centered) {
                lx = x + 10;
                ly = (y + sy / 2) + (fsize * 0.5 / 2);
            }
            this.Text = new Lable(lx, ly, txt, fsize, this.Centered);
            this.Text.Z = z + 1;
            gui.AddElement(this.Text);
        }
        public Remove(gui: Gui) {
            super.Remove(gui);
            gui.RemoveElement(this.Text);
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
            //this.Text.Render(gui);
        }
        public Update(gui: Gui) {
            if (gui.MouseX > this.X && gui.MouseX < this.X + this.SizeX && gui.MouseY > this.Y && gui.MouseY < this.Y + this.SizeY) {
                if (gui.Button == 0) {
                    if (this.State == 0) {
                        this.State = 1;
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
            else {
                this.State = 0;
            }
        }
    }
    class Lable extends Element {
        public X = 0;
        public Y = 0;
        public Text = "";
        public FontSize = 30;
        public Centered = true;
        constructor(x, y, txt, size= 30, c= true, z = 0) {
            super(z);
            this.X = x;
            this.Y = y;
            this.Text = txt;
            this.FontSize = size;
            this.Centered = c;
        }
        public Render(gui: Gui) {
            gui.ctx.fillStyle = "#000000";
            gui.ctx.font = this.FontSize.toString() + "px Arial";
            var x = this.X;
            var y = this.Y;
            if (this.Centered) {
                x = this.X - ((this.Text.length - 1) * (this.FontSize / 4));
                y = this.Y + (this.FontSize * 0.5 / 2);
            }
            gui.ctx.fillText(this.Text, x, y);
        }
    }
    class DropDown extends Button {
        Options: Array<string>;
        OptionsNonDisplay: Array<string> = [];
        OptionButtons: Array<Button> = [];
        OptionSelected = 0;
        Droped = false;
        constructor(gui,x, y, sx, sy, options, fsize = 30, c = true,z = 0) {
            super(gui,x, y, sx, sy, options[0], fsize, c,z);
            this.Options = options;
            this.OptionsNonDisplay = this.Options.slice(0,this.Options.length);
            this.OptionsNonDisplay.shift();
        }
        Drop(gui:Gui) {
            this.Droped = true;
            for (var i = 0; i < this.OptionsNonDisplay.length; ++i) {
                this.OptionButtons.push(new Button(gui, this.X, this.Y + (this.SizeY * (i + 1)), this.SizeX, this.SizeY, this.OptionsNonDisplay[i], this.Text.FontSize, this.Centered, this.Z + 2));
                gui.AddElement(this.OptionButtons[i]);
            }
        }
        Select(Selected,gui:Gui) {
            for (var i = 0; i < this.OptionButtons.length; ++i) {
                gui.RemoveElement(this.OptionButtons[i]);
            }
            this.OptionButtons = [];
            this.Droped = false;
            if (Selected != this.OptionSelected) {
                this.Text.Text = this.Options[Selected];
                var NewOptions = [];
                for (var i = 0; i < this.Options.length; ++i) {
                    if (this.Options[i] != this.Options[Selected]) {
                        NewOptions.push(this.Options[i]);
                    }
                }
                this.OptionSelected = Selected;
                this.OptionsNonDisplay = NewOptions;
            }
        }
        public Remove(gui: Gui) {
            for (var i = 0; i < this.OptionButtons.length; ++i) {
                gui.RemoveElement(this.OptionButtons[i]);
            }
        }
        public Update(gui) {
            super.Update(gui);
            if (this.Droped) {
                for (var i = 0; i < this.OptionButtons.length; ++i) {
                    this.OptionButtons[i].Update(gui);
                    if (this.OptionButtons[i].State == 2) {
                        this.Select(this.Options.indexOf(this.OptionButtons[i].Text.Text),gui);
                    }
                }
                if (this.State == 2) {
                    this.Select(this.OptionSelected,gui);
                }
            }
            else {
                if (this.State == 2) {
                    this.Drop(gui);
                }
            }
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
        public RenderList: Array<Array<Element>> = [];//0 = id, 1 = z
        public ctx: CanvasRenderingContext2D;
        constructor(ctx, width, height) {
            this.ctx = ctx;
            this.Width = width;
            this.Height = height;
            for (var i = 0; i < 10; ++i) {
                this.RenderList[i] = new Array();
            }
        }
        public AddElement(element) {
            this.Elements.push(element);
            this.RenderList[element.Z].push(element);
        }
        public RemoveElement(element :Element) {
            element.Remove(this);
            this.Elements.splice(this.Elements.indexOf(element),1);
            this.RenderList[element.Z].splice(this.RenderList[element.Z].indexOf(element), 1);
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
            for (var i = 0; i < this.RenderList.length; ++i) {
                for (var j = 0; j < this.RenderList[i].length; ++j) {
                    if (this.RenderList[i][j].Active) {
                        this.RenderList[i][j].Render(this);
                    }
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
        public HousesRemaining;
        public HighScore = 0;
        public Map = 0;
        public MaxSand = 6000;
        public MainMenu: Gui;
        public Hud: Gui;
        public LoseScreen: Gui;
        public Credits: Gui;
        public GameSelection: Gui;
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
        public SlumpConst = 0.05;
        public SlumpLimitDry = 10;
        public SlumpLimitWet = 0;
        ////Sim buffers
        public GroundType = new Grid(this.WorldSize, this.WorldSize);//0 = sand,1 = null, 2 is 'Source', 3 is 'Sink'
        public WaterHeight = new Grid(this.WorldSize, this.WorldSize);
        public WaterHeightBuffer = new Grid(this.WorldSize, this.WorldSize);
        public RockHeight = new Grid(this.WorldSize, this.WorldSize, 1);
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
            this.GotoMainMenu();
            //this.InitGuis();
        }
        public Init() {
            this.Canvas = <HTMLCanvasElement> document.getElementById("RenderCanvas");
            this.Canvas.width = (this.PlaySize) + 100;
            this.Canvas.height = (this.PlaySize);
            this.ctx = <CanvasRenderingContext2D> this.Canvas.getContext("2d");
        }
        InitGame() {
            this.PickedUpSand = 0;
            this.Time = 0;
            this.GroundType = new Grid(this.WorldSize, this.WorldSize);//0 = sand,1 = Obstruction, 2 is 'Source', 3 is 'Sink'
            this.WaterHeight = new Grid(this.WorldSize, this.WorldSize);
            this.WaterHeightBuffer = new Grid(this.WorldSize, this.WorldSize);
            this.RockHeight = new Grid(this.WorldSize, this.WorldSize, 1);
            this.GroundHeight = new Grid(this.WorldSize, this.WorldSize);
            this.GroundHeightBuffer = new Grid(this.WorldSize, this.WorldSize);
            this.OutFlowMap = [];
            this.VelocityMapX = new Grid(this.WorldSize, this.WorldSize);
            this.VelocityMapY = new Grid(this.WorldSize, this.WorldSize);
            this.SiltMap = new Grid(this.WorldSize, this.WorldSize);
            this.SiltMapBuffer = new Grid(this.WorldSize, this.WorldSize); this.WaterHeight.MaxHeight = 200;
            this.WaterHeightBuffer.MaxHeight = this.WaterHeight.MaxHeight;
            this.SiltMap.MaxHeight = 1000;
            this.SiltMapBuffer.MaxHeight = this.SiltMap.MaxHeight;
            for (var i = 0; i < 4; ++i) {
                this.OutFlowMap[i] = new Grid(this.WorldSize, this.WorldSize);
            }
            this.Map = (<DropDown>this.GameSelection.Elements[1]).OptionSelected;
            if (this.Map == 0) {
                this.HousesRemaining = 5;
                this.WorldGenClassic();
            }
            if (this.Map == 1) {
                this.HousesRemaining = 20;
                this.WorldGenClassic();
            }
            if (this.Map == 2) {
                this.WorldGenTwoVillages();
            }
            if (this.Map == 3) {
                this.WorldGenTwoVillages();
            }
            if (this.Map == 4) {
                this.WorldGenTwoVillages();
            }
            if (this.Map == 5) {
                this.HousesRemaining = 5;
                this.WorldGenMountains();
            }
            this.GotoHUD();
        } 
        GotoMainMenu() {
            this.GameState = 0;
            this.MainMenu = new Gui(this.ctx, this.PlaySize, this.PlaySize);
            this.MainMenu.AddElement(new Button(this.MainMenu,this.PlaySize / 2, 100, 100, 50, "Start",30));//1
            this.MainMenu.AddElement(new Button(this.MainMenu,this.PlaySize / 2, 200, 100, 50, "Credits"));//3
        }
        GotoGameSelection() {
            this.GameState = 3;
            this.GameSelection = new Gui(this.ctx, this.PlaySize, this.PlaySize);
            this.GameSelection.AddElement(new DropDown(this.GameSelection, 0, 0, 150, 50, ["Classic", "Many Villages", "Two Villages", "Geyser of Death", "4 Corners", "Mountains"],15,false));//1
            this.GameSelection.AddElement(new Button(this.GameSelection,0, 100, 100, 50, "Start"));//3
        }
        GotoHUD() {
            this.GameState = 1;
            this.Hud = new Gui(this.ctx, this.PlaySize, this.PlaySize);
            this.Hud.AddElement(new Button(this.Hud,this.PlaySize, 0, 100, 50, "Restart", 15));//1
            this.Hud.AddElement(new Button(this.Hud,this.PlaySize, 50, 100, 50, "Main Menu", 15));//3
            this.Hud.AddElement(new Lable(this.PlaySize, 125, "Time:", 15, false));
            this.Hud.AddElement(new Lable(this.PlaySize, 150, "Time Number here", 15, false));//5
            this.Hud.AddElement(new Lable(this.PlaySize, 200, "Sand:", 15, false));
            this.Hud.AddElement(new Lable(this.PlaySize, 225, "Sand Number here", 15, false));//7
        }
        GotoLoseScreen() {
            this.GameState = 2;
            this.LoseScreen = new Gui(this.ctx, this.PlaySize, this.PlaySize);
            this.LoseScreen.AddElement(new Button(this.LoseScreen,this.PlaySize, 0, 100, 50, "Restart", 15));//1
            this.LoseScreen.AddElement(new Button(this.LoseScreen,this.PlaySize, 50, 100, 50, "Main Menu", 15));//3
            this.LoseScreen.AddElement(new Lable(50, 100, "You got rekt", 30, false));
            this.LoseScreen.AddElement(new Lable(50, 200, "You lasted a time of:" + this.Time.toString(), 30, false));//5
        }
        GotoCredits() {
            this.GameState = 4;
            this.Credits = new Gui(this.ctx, this.PlaySize, this.PlaySize);
            this.Credits.AddElement(new Button(this.Credits,this.PlaySize, 0, 100, 50, "Main Menu", 15));//1
            this.Credits.AddElement(new Lable(50, 100, "Sam: Programmer, designer", 30, false));
            this.Credits.AddElement(new Lable(50, 150, "Sacha: Designer, tester", 30, false));
            this.Credits.AddElement(new Lable(50, 200, "Nik: Skrub", 30, false));
        }

        public VallyGen(x, y, SeedX, SeedY) {
            var val = Math.sin(x - (y / SeedX)) * SeedY;
            return val;
        }
        public MountainGen(x, y, SeedX, SeedY,SeedZ) {
            var val = 0;
            for (var i = 1; i < 10; ++i) {
                val += Math.sin((x + SeedX) * i) / i * SeedY;
                val += Math.sin(((y - SeedX)/SeedZ) * i) / i * SeedY;
            }
            for (var i = 1; i < 10; ++i) {
                val += Math.sin((x - SeedX) / i) * i * SeedY;
                val += Math.sin(((y + SeedX) / SeedZ) / i) * i * SeedY;
            }
            val -= 10;
            return Math.max(0,val);
        }
        public SlopeGen(x, y) {
            return (2 - ((x / this.WorldSize) + (y / this.WorldSize))) * this.GroundHeight.MaxHeight / 2;
        }
        public WorldGenClassic(ix = 10, iy = 10) {
            var InflowX = ix;
            var InflowY = iy;
            var SeedX = (Math.random() * 5);
            var SeedY = (Math.random() * 10);
            var SeedXR = (Math.random() * 100);
            var SeedYR = (Math.random() * 5);
            this.RockHeight.MaxHeight = 0;
            var XLow = 0;
            var YLow = 0;
            var Low = -1;
            for (var x = 0; x < this.GroundHeight.SizeX; ++x) {
                for (var y = 0; y < this.GroundHeight.SizeY; ++y) {
                    //this.RockHeight.SetValueAt(x, y, Math.max(0,(this.MountainGen(x, y, SeedXR, SeedYR))));
                    this.GroundHeight.SetValueAt(x, y, (this.SlopeGen(x, y) + this.VallyGen(x, y, SeedX, SeedY)));
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
            this.GroundType.SetValueAt(InflowX, InflowY, 2);
            this.GroundType.SetValueAt(XLow, YLow, 3);
            for (var i = 0; i < this.HousesRemaining; ++i) {
                var x = Math.round(Math.random() * (this.WorldSize - 1));
                var y = Math.round(Math.random() * (this.WorldSize - 1));
                var dis = 20;
                if (Math.abs(InflowX - x) > dis && Math.abs(InflowY - y) > dis) {
                    this.GroundType.SetValueAt(x, y, 1);
                }
                else {
                    i--;
                }
            }
        }

        public WorldGenMountains(ix = 10, iy = 10) {
            var InflowX = ix;
            var InflowY = iy;
            var SeedX = (Math.random() * 10);
            var SeedY = (Math.random() * 5);
            var SeedXR = (Math.random() * 100);
            var SeedYR = (Math.random() * 6);
            var SeedZR = (Math.random() * 5);
            var XLow = 0;
            var YLow = 0;
            var Low = -1;
            for (var x = 0; x < this.GroundHeight.SizeX; ++x) {
                for (var y = 0; y < this.GroundHeight.SizeY; ++y) {
                    this.RockHeight.SetValueAt(x, y, Math.max(0,(this.MountainGen(x, y, SeedXR, SeedYR,SeedZR))));
                    this.GroundHeight.SetValueAt(x, y, (this.SlopeGen(x, y) + this.VallyGen(x, y, SeedX, SeedY)));
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
            this.GroundType.SetValueAt(InflowX, InflowY, 2);
            this.GroundType.SetValueAt(XLow, YLow, 3);
            for (var i = 0; i < this.HousesRemaining; ++i) {
                var x = Math.round(Math.random() * (this.WorldSize - 1));
                var y = Math.round(Math.random() * (this.WorldSize - 1));
                var dis = 20;
                if (Math.abs(InflowX - x) > dis && Math.abs(InflowY - y) > dis) {
                    this.GroundType.SetValueAt(x, y, 1);
                }
                else {
                    i--;
                }
            }
        }
        public WorldGenTwoVillages() {
            this.HousesRemaining = 0;
            var InflowX = 10;
            var InflowY = 10;
            this.WorldGenClassic(InflowX,InflowY);
            var Corners = [[0, this.WorldSize], [this.WorldSize, 0]];
            for (var i = 0; i < 2; ++i) {
                var x = Math.round(Math.random() * (this.WorldSize - 1));
                var y = Math.round(Math.random() * (this.WorldSize - 1));
                var dis = 10;
                var disV = 50;
                if (Math.abs(InflowX - x) > dis && Math.abs(InflowY - y) > dis && Math.abs(Corners[i][0] - x) < disV && Math.abs(Corners[i][1] - y) < disV) {
                    this.GroundType.SetValueAt(x, y, 1);
                }
                else {
                    i--;
                }
            }
            this.HousesRemaining = 1;
        }
        public UpdateWorldFlow() {
            for (var x = 0; x < this.GroundType.SizeX; ++x) {
                for (var y = 0; y < this.GroundType.SizeY; ++y) {
                    if (this.GroundType.GetValueAt(x, y) == 2) {
                        var Factor = 100;
                        //var Waves = Math.max(0, (Math.sin((this.Time - this.StartTime) / Factor) * (this.Time - this.StartTime) / (Factor * Math.PI)));
                        //var Waves = Math.max(0,(0.49 * this.Time * Math.sin(this.Time)) + (0.5 * this.Time));
                        var Waves = 0.3 * (this.Time - this.StartTime);
                        var IFlow = this.DeltaTime * Waves;
                        //document.getElementById("Flow").innerHTML = IFlow.toString();
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
                this.GotoLoseScreen();
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
                            var HeightDifference = (this.GroundHeight.GetValueAt(x, y) + this.WaterHeight.GetValueAt(x, y) + this.RockHeight.GetValueAt(x, y)) - (this.GroundHeight.GetValueAt(x + Offset[0], y + Offset[1]) + this.WaterHeight.GetValueAt(x + Offset[0], y + Offset[1]) + this.RockHeight.GetValueAt(x + Offset[0], y + Offset[1]));
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
        public UpdateSandSlumping() {
            for (var x = 0; x < this.GroundHeight.SizeX; ++x) {
                for (var y = 0; y < this.GroundHeight.SizeY; ++y) {
                    var NetVolume = 0
                    for (var i = 0; i < this.SearchSpace.length; ++i) {
                        var VolumeOut = 0;
                        var Offset = this.SearchSpace[i];
                        if (!(x - Offset[0] < 0 || y - Offset[1] < 0 || x - Offset[0] >= this.GroundHeight.SizeX || y - Offset[1] >= this.GroundHeight.SizeY)) {
                            var Lim = this.SlumpLimitDry;
                            if (this.WaterHeight.GetValueAt(x - Offset[0], y - Offset[1]) > 0) {
                                Lim = this.SlumpLimitWet;
                            }
                            var HeightDiffSand = (this.GroundHeight.GetValueAt(x, y) - this.GroundHeight.GetValueAt(x - Offset[0], y - Offset[1]));
                            var HeightDiff = HeightDiffSand + (this.RockHeight.GetValueAt(x, y) - this.RockHeight.GetValueAt(x - Offset[0], y - Offset[1]))
                            if (HeightDiff > Lim) {
                                VolumeOut = HeightDiffSand * this.SlumpConst * this.DeltaTime;
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
                        DX += (this.RockHeight.GetValueAt(x + i, y) + this.GroundHeight.GetValueAt(x + i, y)) - (this.RockHeight.GetValueAt(x + i + 1, y) + this.GroundHeight.GetValueAt(x + i + 1, y));
                        ++count;
                    }
                }
            }
            DX /= count;
            count = 0;
            for (var i = -1; i < 1; ++i) {
                if (!(x < 0 || y + i < 0 || x > this.GroundHeight.SizeX || y + i > this.GroundHeight.SizeY)) {
                    if (!(x < 0 || y + i + 1 < 0 || x > this.GroundHeight.SizeX || y + i + 1 > this.GroundHeight.SizeY)) {
                        DY += (this.RockHeight.GetValueAt(x, y + i) + this.GroundHeight.GetValueAt(x, y + i)) - (this.RockHeight.GetValueAt(x, y + i + 1) + this.GroundHeight.GetValueAt(x, y + i + 1));
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
        Update() {
            this.Time++;
            for (var i = 0; i < this.UpdatePerTick; ++i) {
                if (this.Time >= this.StartTime) { this.UpdateWorldFlow(); }
                this.UpdateWater();
                this.UpdateVelocity();
                this.UpdateSilting();
                this.UpdateSiltTransport();
                this.UpdateSandSlumping();
            }
            //this.Inflow += 1;
        }
        RenderBoarder(xo = 0) {
            var Boarder = 2;
            this.ctx.beginPath();
            this.ctx.rect(1,1, this.Canvas.width - (Boarder + xo), this.Canvas.height-Boarder);
            this.ctx.lineWidth = 2;
            this.ctx.strokeStyle = 'black';
            this.ctx.stroke();
        }
        Render() {
            this.ctx.fillStyle = "#FFFFFF";
            this.ctx.clearRect(0, 0, this.Canvas.width, this.Canvas.height);
            for (var x = 0; x < this.GroundHeight.SizeX; ++x) {
                for (var y = 0; y < this.GroundHeight.SizeY; ++y) {
                    //FFC877 Sand brightest.

                    var BrightnessDec = Math.min(1,Math.max(0.1, (this.GroundHeight.GetValueAt(x, y) + this.RockHeight.GetValueAt(x,y)) / (this.GroundHeight.MaxHeight + this.RockHeight.MaxHeight)));
                    var R = BrightnessDec;
                    var G = BrightnessDec;
                    var B = BrightnessDec;
                    if (this.GroundHeight.GetValueAt(x, y) > 0.1) {
                        R *= 255;
                        G *= 200;
                        B *= 119;
                    }
                    else {
                        R *= 123;
                        G *= 123;
                        B *= 123;
                    }
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
                    if (R > 255) { R = 255; }
                    if (G > 255) { G = 255; }
                    if (B > 255) { B = 255; }
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
            this.RenderBoarder(100);
        }
        PollInput() {
            var DeltaHeight = 0;
            var HeightPerSecond = 40;
            //if (Button == 0) { DeltaHeight = HeightPerSecond; }
            //if (Button == 2) { DeltaHeight = HeightPerSecond; }
            if (MouseButton == 1) { //DeltaHeight = -HeightPerSecond; }
                //document.getElementById("out").innerHTML = this.WaterHeight.GetValueAt(MouseChunkX, MouseChunkY).toString() + ":Water ," + this.GroundHeight.GetValueAt(MouseChunkX, MouseChunkY) + ":Ground," + (this.SiltMap.GetValueAt(MouseChunkX, MouseChunkY) / (this.SedimentCapacityConst * this.WaterHeight.GetValueAt(MouseChunkX, MouseChunkY))) + "%:Silts";
                
            }
            var Direction = 0;
            if (MouseButton == 0) {
                Direction = -1;
            }
            if (MouseButton == 2) {
                Direction = 1;
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
        public CanDig(X, Y, xo, yo, SizeOffset, Min, WaterDepth) {
            if (X < 0) { return false; }
            if (X >= this.WorldSize) { return false; }
            if (Y < 0) { return false; }
            if (Y >= this.WorldSize) { return false; }
            if (this.WaterHeight.GetValueAt(X, Y) > WaterDepth) { return false; }
            if (this.DistributionFunction(xo - SizeOffset, yo - SizeOffset) + Min < 0) { return false; }
            if (this.GroundType.GetValueAt(xo - SizeOffset, yo - SizeOffset) == 1) { return false; }
            return true;
        }
        public ManipulateSand(ChunkX, ChunkY, Size, Direction, factor) {
            var SizeOffset = Size / 2;
            var Area = 0;
            var Factor = factor;
            var Depth = 0;
            if (Direction == 1)
            {
                Depth = 15;
            }
            var Min = -this.DistributionFunction(-SizeOffset, 0);
            for (var xo = 0; xo < Size; ++xo) {
                var X = MouseChunkX - (xo - SizeOffset);
                for (var yo = 0; yo < Size; ++yo) {
                    if (this.CanDig(X, Y, xo, yo, SizeOffset, Min, Depth)) {
                        Area += this.DistributionFunction(xo - SizeOffset, yo - SizeOffset) + Min;
                    }
                }
            }
            if (Factor * Area * Direction > this.PickedUpSand) {
                Factor *= (this.PickedUpSand / Area);
            }
            for (var xo = 0; xo < Size; ++xo) {
                var X = MouseChunkX - (xo - SizeOffset);
                for (var yo = 0; yo < Size; ++yo) {
                    var Y = MouseChunkY - (yo - SizeOffset);
                    if (this.CanDig(X, Y, xo, yo, SizeOffset, Min, Depth)) {
                        //Simulate
                        var Distribution = this.DistributionFunction(xo - SizeOffset, yo - SizeOffset) + Min;
                        Distribution = (Direction * Distribution * Factor) / (Area);
                        //Distribution *= Direrction;

                        if (this.GroundHeight.GetValueAt(X, Y) + Distribution > this.GroundHeight.MaxHeight) {
                            Distribution = this.GroundHeight.MaxHeight - this.GroundHeight.GetValueAt(X, Y);
                        } if (this.GroundHeight.GetValueAt(X, Y) + Distribution < 0) {
                            Distribution = -this.GroundHeight.GetValueAt(X, Y);
                        }

                        if (this.PickedUpSand - Distribution > this.MaxSand) {
                            Distribution = this.MaxSand - this.PickedUpSand;
                        }
                        if (this.PickedUpSand - Distribution < 0) {
                            Distribution = this.PickedUpSand;
                        }
                        //if (Math.abs(Distribution) < 0.1) {
                        //    Distribution = 0;
                        //}
                        this.GroundHeight.AddValueAt(X, Y, Distribution);
                        this.PickedUpSand -= Distribution;
                    }
                }
            }
        }
        public MainLoop() {
            switch(this.GameState)
            {
                case 0://MainMenu
                    this.ctx.clearRect(0, 0, this.Canvas.width, this.Canvas.height);
                    this.MainMenu.Update(MouseX, MouseY, MouseButton);
                    this.MainMenu.Render();
                    if ((<Button>this.MainMenu.Elements[1]).State == 2) {
                        this.GotoGameSelection();
                    }
                    if ((<Button>this.MainMenu.Elements[3]).State == 2) {
                        this.GotoCredits();
                    }
                    ///this.MainMenu.Update(MouseX, MouseY, MouseButton);
                    break;
                case 1://Game
                    (<Lable>this.Hud.Elements[5]).Text = this.Time.toString();
                    (<Lable>this.Hud.Elements[7]).Text = this.PickedUpSand.toString();
                    this.PollInput();
                    this.Render();
                    this.Update();
                    this.Hud.Update(MouseX, MouseY, MouseButton);
                    this.Hud.Render();
                    if ((<Button>this.Hud.Elements[1]).State == 2) {
                        this.InitGame();
                    }
                    if ((<Button>this.Hud.Elements[3]).State == 2) {
                        this.GotoMainMenu();
                    }
                    ///this.Hud.Update(MouseX, MouseY, MouseButton);
                    break;
                case 2://Loss
                    (<Lable>this.LoseScreen.Elements[5]).Text = "You lasted a time of:" + this.Time.toString();
                    this.ctx.clearRect(0, 0, this.Canvas.width, this.Canvas.height);
                    this.LoseScreen.Update(MouseX, MouseY, MouseButton);
                    this.LoseScreen.Render();
                    if ((<Button>this.LoseScreen.Elements[1]).State == 2) {
                        this.InitGame();
                    }
                    if ((<Button>this.LoseScreen.Elements[3]).State == 2) {
                        this.GotoMainMenu();
                    }
                    ///this.LoseScreen.Update(MouseX, MouseY, MouseButton);
                    break;
                case 3://Map Selection
                    this.ctx.clearRect(0, 0, this.Canvas.width, this.Canvas.height);
                    this.GameSelection.Update(MouseX, MouseY, MouseButton);
                    this.GameSelection.Render();
                    if ((<Button>this.GameSelection.Elements[3]).State == 2) {
                        this.InitGame();
                    }
                    ///this.GameSelection.Update(MouseX, MouseY, MouseButton);
                    break;
                case 4://Credits
                    this.ctx.clearRect(0, 0, this.Canvas.width, this.Canvas.height);
                    this.Credits.Update(MouseX, MouseY, MouseButton);
                    this.Credits.Render();
                    if ((<Button>this.Credits.Elements[1]).State == 2) {
                        this.GotoMainMenu();
                    }
                    ///this.Credits.Update(MouseX, MouseY, MouseButton);
                    break;
                case 5://Tutorial
                    break;
            }
            this.RenderBoarder();
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
    //world.MainLoop();
    Interval = setInterval(function () { world.MainLoop(); }, UpdateSpeed);
}