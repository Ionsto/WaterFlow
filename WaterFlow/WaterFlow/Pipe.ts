/// <refrence href="WebGL.d.ts">
/*Version 2.2
Bug List:
*/
var world = null;
module Pipe {
    class Grid {
        public SizeX = 100;
        public SizeY = 100;
        public SizeTotal = this.SizeX * this.SizeY;
        RawGrid: Float64Array;
        MaxHeight = 50;
        Averadge = 0;
        constructor(x: number, y: number, d = 0) {
            this.SizeX = x;
            this.SizeY = y;
            this.SizeTotal = this.SizeX * this.SizeY;
            this.RawGrid = new Float64Array(x * y);
            if (d != 0) {
                this.Fill(d);
            }
        }
        public Fill(x: number) {
            for (var i = 0; i < this.SizeTotal; ++i) {
                this.RawGrid[i] = x;
            }
        }
        public Set(grid: Grid) {
            for (var i = 0; i < this.SizeTotal; ++i) {
                this.RawGrid[i] = grid.RawGrid[i];
            }
            //this.RawGrid.buffer = grid.RawGrid.subarray(0, grid.SizeTotal);
        }
        public GetValueAt(x: number, y: number): number {
            //if (x >= 0 && x < this.SizeX) {
            //  if (y >= 0 && y < this.SizeY) {
            return this.RawGrid[(x * this.SizeX) + y];
            //  }
            //}
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
    class Village {
        PosX = 0;
        PosY = 0
        SizeX = 0;
        SizeY = 0;
        OffsetX = 0;
        OffsetY = 0;
        Alive = true;
        constructor(x, y, sx, sy,world:World) {
            this.PosX = x;
            this.PosY = y;
            this.SizeX = sx;
            this.SizeY = sy;
            this.OffsetX = Math.round(-sx/2);
            this.OffsetY = Math.round(-sy/2);
            for (var xa = this.PosX; xa < this.PosX + this.SizeX; ++xa) {
                for (var ya = this.PosY; ya < this.PosY + this.SizeY; ++ya) {
                    if (xa < world.WorldSize && ya < world.WorldSize) {
                        world.GroundType.SetValueAt(xa, ya, 1);
                    }
                }
            }
        }
        Update(world: World) {
            if (this.Alive) {
                for (var x = this.PosX; x < this.PosX + this.SizeX; ++x) {
                    if (!this.Alive) {
                        break;
                    }
                    for (var y = this.PosY; y < this.PosY + this.SizeY; ++y) {
                        if (world.WaterHeight.GetValueAt(x, y) > 0.1) {
                            if (this.Alive) {
                                --world.HousesRemaining;
                            }
                            this.Alive = false;
                            break;
                        }
                    }
                }
                if (!this.Alive) {
                    for (var xa = this.PosX; xa < this.PosX + this.SizeX; ++xa) {
                        for (var ya = this.PosY; ya < this.PosY + this.SizeY; ++ya) {
                            if (xa <= world.WorldSize && ya <= world.WorldSize) {
                                world.GroundType.SetValueAt(xa, ya, 0);
                            }
                        }
                    }
                    world.Villages.splice(world.Villages.indexOf(this), 1);
                }
            }
        }
    }
    class Element {
        public Active = true;
        public Z = 0;
        constructor(z = 0) {
            this.Z = z;
        }
        public Remove(gui: Gui) { }
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
        constructor(gui: Gui, x, y, sx, sy, txt, fsize= 30, c = true, z = 0) {
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
        constructor(gui, x, y, sx, sy, options, fsize = 30, c = true, z = 0) {
            super(gui, x, y, sx, sy, options[0], fsize, c, z);
            this.Options = options;
            this.OptionsNonDisplay = this.Options.slice(0, this.Options.length);
            this.OptionsNonDisplay.shift();
        }
        Drop(gui: Gui) {
            this.Droped = true;
            for (var i = 0; i < this.OptionsNonDisplay.length; ++i) {
                this.OptionButtons.push(new Button(gui, this.X, this.Y + (this.SizeY * (i + 1)), this.SizeX, this.SizeY, this.OptionsNonDisplay[i], this.Text.FontSize, this.Centered, this.Z + 2));
                gui.AddElement(this.OptionButtons[i]);
            }
        }
        Select(Selected, gui: Gui) {
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
                        this.Select(this.Options.indexOf(this.OptionButtons[i].Text.Text), gui);
                    }
                }
                if (this.State == 2) {
                    this.Select(this.OptionSelected, gui);
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
        public RenderBack = true;
        public MouseX = 0;
        public MouseY = 0;
        public Button = -1;
        public Width = 0;
        public Height = 0;
        public Active = true;
        public Elements: Array<Element> = [];
        public RenderList: Array<Array<Element>> = [];//0 = id, 1 = z
        public ctx: CanvasRenderingContext2D;
        constructor(ctx, width, height, RenderBack = true) {
            this.RenderBack = RenderBack;
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
        public RemoveElement(element: Element) {
            element.Remove(this);
            this.Elements.splice(this.Elements.indexOf(element), 1);
            this.RenderList[element.Z].splice(this.RenderList[element.Z].indexOf(element), 1);
        }
        Update(mx, my, b) {
            this.MouseX = mx;
            this.MouseY = my;
            this.Button = b;
            if (this.Active) {
                for (var i = 0; i < this.Elements.length; ++i) {
                    if (this.Elements[i].Active) {
                        this.Elements[i].Update(this);
                    }
                }
            }
        }
        Render() {
            if (this.Active) {
                if (this.RenderBack) {
                    this.ctx.fillStyle = "#FFFFFF";
                    this.ctx.fillRect(0, 0, this.Width, this.Height);
                }
                for (var i = 0; i < this.RenderList.length; ++i) {
                    for (var j = 0; j < this.RenderList[i].length; ++j) {
                        if (this.RenderList[i][j].Active) {
                            this.RenderList[i][j].Render(this);
                        }
                    }
                }
            }
        }
    }
    console.log("Grid defined");
    class World {
        //game values
        public GuiCanvas: HTMLCanvasElement;
        public RenderCanvas: HTMLCanvasElement;
        public Guictx: CanvasRenderingContext2D;
        public RenderctxHTML: CanvasRenderingContext2D;
        //WebGL
        RenderctxGL: WebGLRenderingContext;
        WillRenderWebGL = true;
        CanRenderWebGL = true;
        ShaderProgram: WebGLProgram;
        VertexPos: number;
        ColourPos: number;
        TexturePos: number;
        ColourTexture: WebGLTexture;
        TextureData : Uint8Array;
        GridVertexBufferSize = 0;
        GridVertexBuffer: WebGLBuffer = null;
        GridColourBufferSize = 0;
        GridColourBuffer: WebGLBuffer = null;
        GridIndexBufferSize = 0;
        GridIndexBuffer: WebGLBuffer = null;
        ColourArray: Float32Array;
        ShaderType = 0;

        public PickedUpSand = 0;
        public GameState = 0;
        public GridToCanvas = 5;
        public PlaySize = 500;
        public WorldSize = this.PlaySize / this.GridToCanvas;
        public StartTime = 10;
        public Time = 0;
        public RealTime = 0;
        public HousesRemaining;
        public HighScore = 0;
        public Map = 0;
        public MaxSand = 6000;
        public MainMenu: Gui;
        public Hud: Gui;
        public LoseScreen: Gui;
        public Credits: Gui;
        public GameSelection: Gui;//Normal
        public GameSelectionCustom: Gui;//custom
        public SandDiggingSize = 40;
        public SandDiggingSpeed = 1;
        public SandPlacingSpeed = 1;
        ///Sim values
        public DeltaTime = 1;
        public Gravity = 10;
        public PipeLength = 1;
        public PipeCrossSection = 0.01;
        public UpdatePerTick = 2;
        public GameTimeScale = 0.01;
        public SedimentDepositingConst = 1;
        public SedimentDissolvingConst = 1;
        public SedimentCapacityConst = 0.01;
        public Inflow = 0.3;
        public OutFlow = 1000;
        public MaxOutFlow = 100;
        public SlumpConst = 0.03;
        public SlumpLimitDry = 10;
        public SlumpLimitWet = 0;
        ////Sim buffers
        public GroundType = new Grid(this.WorldSize, this.WorldSize);//0 = sand,1 = null, 2 is 'Source', 3 is 'Sink'
        public WaterHeight = new Grid(this.WorldSize, this.WorldSize);
        public WaterHeightBuffer = new Grid(this.WorldSize, this.WorldSize);
        public RockHeight = new Grid(this.WorldSize, this.WorldSize, 1);
        public GroundHeight = new Grid(this.WorldSize, this.WorldSize, 1);
        public GroundHeightBuffer = new Grid(this.WorldSize, this.WorldSize, 1);
        public OutFlowMap: Array<Grid> = [];
        public VelocityMapX = new Grid(this.WorldSize, this.WorldSize);
        public VelocityMapY = new Grid(this.WorldSize, this.WorldSize);
        public SiltMap = new Grid(this.WorldSize, this.WorldSize);
        public SiltMapBuffer = new Grid(this.WorldSize, this.WorldSize);
        public Villages: Array<Village> = [];
        VillageSize = 4;
        SearchSpace = [[1, 0], [0, 1], [-1, 0], [0, -1]];
        constructor() {
            this.Init();
            this.GotoMainMenu();
            //this.InitGuis();
        }
        public Init() {
            this.GuiCanvas = <HTMLCanvasElement> document.getElementById("GuiCanvas");
            this.RenderCanvas = <HTMLCanvasElement> document.getElementById("RenderCanvas");
            this.GuiCanvas.width = (this.PlaySize) + 100;
            this.GuiCanvas.height = (this.PlaySize);
            this.RenderCanvas.width = (this.PlaySize);
            this.RenderCanvas.height = (this.PlaySize);
            this.Guictx = <CanvasRenderingContext2D> this.GuiCanvas.getContext("2d");
            this.InitRenderCanvas();
            if (this.WillRenderWebGL) {
                this.InitGL();
            }
        }
        public InitRenderCanvas() {
            try {
                this.RenderctxGL = this.RenderCanvas.getContext("webgl") || this.RenderCanvas.getContext("experimental-webgl");
                this.RenderctxGL.viewport(0, 0, this.RenderCanvas.width, this.RenderCanvas.height);
            } catch (e) {
                console.log(e);
            }
            if (!this.RenderctxGL) {
                console.log("Could not initialise WebGL");
                this.RenderctxHTML = this.RenderCanvas.getContext("2d");
                this.CanRenderWebGL = false;
                this.WillRenderWebGL = false;
            }
        }
        InitGL() {
            //Shaders e.g.
            //this.InitShaderSmooth();
            //this.InitShaderContoured();
            this.InitShaderStaggerd();
            this.RenderctxGL.clearColor(0.0, 0.0, 0.0, 1.0);
            this.RenderctxGL.enable(this.RenderctxGL.DEPTH_TEST);

        }
        ResetGL() {
            //Buffers e.g.
            this.InitBuffers();
        }
        GetShader(gl, id) {
            var shaderScript = <HTMLScriptElement>document.getElementById(id);
            if (!shaderScript) {
                return null;
            }
            var str = "";
            var k = shaderScript.firstChild;
            while (k) {
                if (k.nodeType == 3) {
                    str += k.textContent;
                }
                k = k.nextSibling;
            }
            var shader;
            if (shaderScript.type == "x-shader/x-fragment") {
                shader = gl.createShader(gl.FRAGMENT_SHADER);
            } else if (shaderScript.type == "x-shader/x-vertex") {
                shader = gl.createShader(gl.VERTEX_SHADER);
            } else {
                return null;
            }
            console.log("Compiling Shader " + shaderScript.type)
            gl.shaderSource(shader, str);
            gl.compileShader(shader);
            if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
                console.log(gl.getShaderInfoLog(shader));
                return null;
            }
            return shader;
        }

        InitShaderSmooth() {
            this.ShaderType = 0;
            var fragmentShader = this.GetShader(this.RenderctxGL, "FragmentShader");
            var vertexShader = this.GetShader(this.RenderctxGL, "VertexShader");
            this.ShaderProgram = this.RenderctxGL.createProgram();
            this.RenderctxGL.attachShader(this.ShaderProgram, vertexShader);
            this.RenderctxGL.attachShader(this.ShaderProgram, fragmentShader);
            this.RenderctxGL.linkProgram(this.ShaderProgram);
            if (!this.RenderctxGL.getProgramParameter(this.ShaderProgram, this.RenderctxGL.LINK_STATUS)) {
                console.log("Could not initialise shaders");
            }
            this.RenderctxGL.useProgram(this.ShaderProgram);
            this.VertexPos = this.RenderctxGL.getAttribLocation(this.ShaderProgram, "VertexPosition");
            this.RenderctxGL.enableVertexAttribArray(this.VertexPos);
            this.ColourPos = this.RenderctxGL.getAttribLocation(this.ShaderProgram, "VertexColour");
            this.RenderctxGL.enableVertexAttribArray(this.ColourPos);
        }
        InitShaderContoured() {
            this.ShaderType = 1;
            var fragmentShader = this.GetShader(this.RenderctxGL, "ContoursFragShader");
            var vertexShader = this.GetShader(this.RenderctxGL, "ContoursVertShader");
            this.ShaderProgram = this.RenderctxGL.createProgram();
            this.RenderctxGL.attachShader(this.ShaderProgram, vertexShader);
            this.RenderctxGL.attachShader(this.ShaderProgram, fragmentShader);
            this.RenderctxGL.linkProgram(this.ShaderProgram);
            if (!this.RenderctxGL.getProgramParameter(this.ShaderProgram, this.RenderctxGL.LINK_STATUS)) {
                console.log("Could not initialise shaders");
            }
            this.RenderctxGL.useProgram(this.ShaderProgram);
            this.VertexPos = this.RenderctxGL.getAttribLocation(this.ShaderProgram, "VertexPosition");
            this.RenderctxGL.enableVertexAttribArray(this.VertexPos);
            this.ColourPos = this.RenderctxGL.getAttribLocation(this.ShaderProgram, "VertexColour");
            this.RenderctxGL.enableVertexAttribArray(this.ColourPos);
        }
        InitShaderStaggerd() {
            this.ShaderType = 2;
            var fragmentShader = this.GetShader(this.RenderctxGL, "StaggerdFragShader");
            var vertexShader = this.GetShader(this.RenderctxGL, "StaggerdVertShader");
            this.ShaderProgram = this.RenderctxGL.createProgram();
            this.RenderctxGL.attachShader(this.ShaderProgram, vertexShader);
            this.RenderctxGL.attachShader(this.ShaderProgram, fragmentShader);
            this.RenderctxGL.linkProgram(this.ShaderProgram);
            if (!this.RenderctxGL.getProgramParameter(this.ShaderProgram, this.RenderctxGL.LINK_STATUS)) {
                console.log("Could not initialise shaders");
            }
            this.RenderctxGL.useProgram(this.ShaderProgram);
            this.VertexPos = this.RenderctxGL.getAttribLocation(this.ShaderProgram, "VertexPosition");
            this.RenderctxGL.enableVertexAttribArray(this.VertexPos);
            this.ColourPos = this.RenderctxGL.getAttribLocation(this.ShaderProgram, "VertexColour");
            this.RenderctxGL.enableVertexAttribArray(this.ColourPos);
            this.TexturePos = this.RenderctxGL.getAttribLocation(this.ShaderProgram, "VertexColour");
            this.RenderctxGL.enableVertexAttribArray(this.TexturePos);

            var Size = this.WorldSize;//Math.pow(2, Math.ceil(Math.log(this.WorldSize) / Math.log(2)));
            //alert(Size);
            //this.RenderctxGL.enable(this.RenderctxGL.TEXTURE_2D);
            this.TextureData = new Uint8Array(Size * Size);
            this.ColourTexture = this.RenderctxGL.createTexture();
            this.RenderctxGL.bindTexture(this.RenderctxGL.TEXTURE_2D, this.ColourTexture);
            this.RenderctxGL.texImage2D(this.RenderctxGL.TEXTURE_2D, 0, this.RenderctxGL.RGBA, 1, 1, 0, this.RenderctxGL.RGBA, this.RenderctxGL.UNSIGNED_BYTE, this.TextureData);
            this.RenderctxGL.texParameteri(this.RenderctxGL.TEXTURE_2D, this.RenderctxGL.TEXTURE_MAG_FILTER, this.RenderctxGL.LINEAR);
            //this.RenderctxGL.texParameteri(this.RenderctxGL.TEXTURE_2D, this.RenderctxGL.TEXTURE_MIN_FILTER, this.RenderctxGL.LINEAR_MIPMAP_NEAREST);
            //this.RenderctxGL.generateMipmap(this.RenderctxGL.TEXTURE_2D);
            //this.RenderctxGL.bindTexture(this.RenderctxGL.TEXTURE_2D, null);
        }
        InitBuffers() {
            var Vertices = [
            //    0, 1.0,
            //    -1.0, -1.0,
            //    1.0, -1.0,
            ];
            var Colours = [
            //    1, 0, 0.0, 0.0,
            //    1.0, 0.5, 0.0,
            //    1.0, -1.0, 0.0
            ];
            var Indicies = [
                //0, 1, 2
            ];
            if (this.GridVertexBuffer != null) {
                this.RenderctxGL.deleteBuffer(this.GridVertexBuffer);
            }

            this.GridVertexBuffer = this.RenderctxGL.createBuffer();
            this.RenderctxGL.bindBuffer(this.RenderctxGL.ARRAY_BUFFER, this.GridVertexBuffer);
            var HSize = (this.WorldSize - 1) / 2;
            for (var x = 0; x < this.WorldSize; ++x) {
                for (var y = 0; y < this.WorldSize; ++y) {
                    Vertices.push((x / HSize) - 1, 1-(y / HSize));
                }
            }
            this.RenderctxGL.bufferData(this.RenderctxGL.ARRAY_BUFFER, new Float32Array(Vertices), this.RenderctxGL.STATIC_DRAW);
            this.GridVertexBufferSize = Vertices.length;
            this.GridColourBuffer = this.RenderctxGL.createBuffer();
            this.RenderctxGL.bindBuffer(this.RenderctxGL.ARRAY_BUFFER, this.GridColourBuffer);
            for (var x = 0; x < this.WorldSize; ++x) {
                for (var y = 0; y < this.WorldSize; ++y) {
                    Colours.push(0,0,1,0);
                }
            }
            this.ColourArray = new Float32Array(Colours);
            this.RenderctxGL.bufferData(this.RenderctxGL.ARRAY_BUFFER, this.ColourArray, this.RenderctxGL.STREAM_DRAW);
            this.GridColourBufferSize = Colours.length;
            this.GridIndexBuffer = this.RenderctxGL.createBuffer();
            this.RenderctxGL.bindBuffer(this.RenderctxGL.ELEMENT_ARRAY_BUFFER, this.GridIndexBuffer);
            for (var x = 0; x < this.WorldSize-1; ++x) {
                for (var y = 0; y < this.WorldSize- 1; ++y) {
                    var pos = x + (y * this.WorldSize);
                    Indicies.push(pos, pos + 1, pos + 1 + this.WorldSize);
                    Indicies.push(pos, pos + this.WorldSize, pos + 1 + this.WorldSize);
                }
            }
            this.RenderctxGL.bufferData(this.RenderctxGL.ELEMENT_ARRAY_BUFFER, new Uint16Array(Indicies), this.RenderctxGL.STATIC_DRAW);
            this.GridIndexBufferSize = Indicies.length;
        }

        InitGame() {
            this.WillRenderWebGL = true;
            this.PickedUpSand = 0;
            this.Time = 0;
            if ((<DropDown>this.GameSelection.Elements[7]).OptionSelected == 1) {
                this.WillRenderWebGL = false;
            }
            if (!this.CanRenderWebGL) { this.WillRenderWebGL = false;}
            if (this.CanRenderWebGL) {
                if (!this.RenderctxGL) {
                    this.InitGL();
                }
                this.GridToCanvas = 4;
                this.PlaySize = 500;
                this.WorldSize = (this.PlaySize / this.GridToCanvas) + 1;
            }
            else {
                this.RenderctxGL = null;
                this.RenderctxHTML = this.Guictx;
                this.GridToCanvas = 4;
                this.PlaySize = 500;
                this.WorldSize = this.PlaySize / this.GridToCanvas;
            }
            this.Villages = [];
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
            if (this.Map == 0) {//Classic
                this.HousesRemaining = 5;
                this.MaxSand = 30000;//6000
                this.WorldGenClassic();
            }
            if (this.Map == 1) {//ManyVillages
                this.HousesRemaining = 20;
                this.MaxSand = 30000;//6000
                this.WorldGenClassic();
                this.HousesRemaining = 15;
            }
            if (this.Map == 2) {//Tow villages
                this.MaxSand = 35000;//7000
                this.WorldGenTwoVillages();
            }
            if (this.Map == 3) {
                this.WorldGenTwoVillages();
            }
            if (this.Map == 4) {
                this.WorldGenTwoVillages();
            }
            if (this.Map == 5) {
                this.MaxSand = 25000;//5000
                this.HousesRemaining = 5;
                this.WorldGenMountains();
            }
            if (this.WillRenderWebGL) {
                this.ResetGL();
            }
            this.MaxSand /= this.GridToCanvas;
            this.GotoHUD();
        }
        GotoMainMenu() {
            this.GameState = 0;
            this.MainMenu = new Gui(this.Guictx, this.PlaySize, this.PlaySize);
            this.MainMenu.AddElement(new Button(this.MainMenu, (this.PlaySize - 125) / 2, 100, 250, 50, "Start", 30));//1
            this.MainMenu.AddElement(new Button(this.MainMenu, (this.PlaySize - 125) / 2, 160, 250, 50, "Credits"));//3
            this.MainMenu.AddElement(new Button(this.MainMenu, (this.PlaySize - 125) / 2, 220, 250, 50, "Reload Shaders",30));//5
        }
        GotoGameSelection() {
            this.GameState = 3;
            this.GameSelection = new Gui(this.Guictx, this.PlaySize, this.PlaySize);
            this.GameSelectionCustom = new Gui(this.Guictx, this.PlaySize, this.PlaySize,false);
            this.GameSelection.AddElement(new DropDown(this.GameSelection, 0, 0, 150, 50, ["Classic", "Many Villages", "Two Villages", "Geyser of Death", "4 Corners", "Mountains"], 15, false));//1
            this.GameSelection.AddElement(new Button(this.GameSelection, 0, 100, 100, 50, "Start"));//3
            this.GameSelection.AddElement(new DropDown(this.GameSelection, 170, 0, 90, 50, ["Defualt", "Custom"], 15, false));//5
            this.GameSelection.AddElement(new DropDown(this.GameSelection, 290, 0, 90, 50, ["WebGL", "HTML"], 15, false));//7
        }
        SetGameSelectionCustom(State) {
            if (!State) {
                this.GameSelectionCustom.Active = false;
            }
            else {
                this.GameSelectionCustom = new Gui(this.Guictx, this.PlaySize, this.PlaySize,false);
                //this.GameSelectionCustom.AddElement(new DropDown(this.GameSelectionCustom, 0, 0, 150, 50, ["Classic", "Many Villages", "Two Villages", "Geyser of Death", "4 Corners", "Mountains"], 15, false));//1
                this.GameSelectionCustom.AddElement(new Button(this.GameSelectionCustom, 200, 100, 100, 50, "Start"));//3
                //this.GameSelectionCustom.AddElement(new DropDown(this.GameSelectionCustom, 170, 0, 90, 50, ["Defualt", "Custom"], 15, false));//1
            }
        }
        GotoHUD() {
            this.GameState = 1;
            this.Hud = new Gui(this.Guictx, this.GuiCanvas.width, this.GuiCanvas.width,false);
            this.Hud.AddElement(new Button(this.Hud, this.PlaySize, 0, 100, 50, "Restart", 15));//1
            this.Hud.AddElement(new Button(this.Hud, this.PlaySize, 50, 100, 50, "Main Menu", 15));//3
            this.Hud.AddElement(new Lable(this.PlaySize, 125, "Time:", 15, false));
            this.Hud.AddElement(new Lable(this.PlaySize, 150, "Time Number here", 15, false));//5
            this.Hud.AddElement(new Lable(this.PlaySize, 200, "Sand:", 15, false));
            this.Hud.AddElement(new Lable(this.PlaySize, 225, "Sand Number here", 15, false));//7
            this.Hud.AddElement(new Lable(this.PlaySize, 250, "Lives:", 15, false));
            this.Hud.AddElement(new Lable(this.PlaySize, 275, "Live Number here", 15, false));//9
            this.DeltaTimeCalculate();
        }
        GotoLoseScreen() {
            this.GameState = 2;
            this.LoseScreen = new Gui(this.Guictx, this.PlaySize, this.PlaySize);
            this.LoseScreen.AddElement(new Button(this.LoseScreen, this.PlaySize, 0, 100, 50, "Restart", 15));//1
            this.LoseScreen.AddElement(new Button(this.LoseScreen, this.PlaySize, 50, 100, 50, "Main Menu", 15));//3
            this.LoseScreen.AddElement(new Lable(50, 100, "You lost", 30, false));
            this.LoseScreen.AddElement(new Lable(50, 200, "You lasted a time of:" + (this.Time.toFixed(0)).toString(), 30, false));//5
        }
        GotoCredits() {
            this.GameState = 4;
            this.Credits = new Gui(this.Guictx, this.PlaySize, this.PlaySize);
            this.Credits.AddElement(new Button(this.Credits, this.PlaySize, 0, 100, 50, "Main Menu", 15));//1
            this.Credits.AddElement(new Lable(50, 100, "Sam: Programmer, designer", 30, false));
            this.Credits.AddElement(new Lable(50, 150, "Sacha: Designer, tester", 30, false));
            this.Credits.AddElement(new Lable(50, 200, "Nik: Skrub", 30, false));
        }

        public VallyGen(x, y, SeedX, SeedY, SeedZ) {
            x *= this.GridToCanvas / 5;
            y *= this.GridToCanvas / 5;
            var val = Math.sin((x - (y / SeedX)) / SeedZ) * SeedY;
            return val;
        }
        public MountainGen(x, y, SeedX, SeedY, SeedZ) {
            x *= this.GridToCanvas / 5;
            y *= this.GridToCanvas / 5;
            var val = 0;
            for (var i = 1; i < 10; ++i) {
                val += Math.sin((x + SeedX) * i) / i * SeedY;
                val += Math.sin(((y - SeedX) / SeedZ) * i) / i * SeedY;
            }
            for (var i = 1; i < 10; ++i) {
                val += Math.sin((x - SeedX) / i) * i * SeedY;
                val += Math.sin(((y + SeedX) / SeedZ) / i) * i * SeedY;
            }
            val -= 10;
            return Math.max(0, val);
        }
        public SlopeGen(x, y) {
            return (2 - ((x / this.WorldSize) + (y / this.WorldSize))) * this.GroundHeight.MaxHeight / 2;
        }
        public WorldGenClassic(ix = 10, iy = 10) {
            var InflowX = ix;
            var InflowY = iy;
            var SeedX = (Math.random()) + 0.5;
            var SeedY = (Math.random() * 10);
            var SeedZ = (Math.random() * 10);
            var SeedXR = (Math.random() * 100);
            var SeedYR = (Math.random() * 5);
            this.RockHeight.MaxHeight = 0;
            var XLow = 0;
            var YLow = 0;
            var Low = -1;
            for (var x = 0; x < this.GroundHeight.SizeX; ++x) {
                for (var y = 0; y < this.GroundHeight.SizeY; ++y) {
                    //this.RockHeight.SetValueAt(x, y, Math.max(0,(this.MountainGen(x, y, SeedXR, SeedYR))));
                    this.GroundHeight.SetValueAt(x, y, (this.SlopeGen(x, y) + this.VallyGen(x, y, SeedX, SeedY, SeedZ)));
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
            this.GroundType.SetValueAt(InflowX, InflowY, -2);
            this.GroundType.SetValueAt(XLow, YLow, -3);
            for (var i = 0; i < this.HousesRemaining; ++i) {
                var x = Math.round(Math.random() * (this.WorldSize - (this.VillageSize + 1)));
                var y = Math.round(Math.random() * (this.WorldSize - (this.VillageSize+1)));
                var dis = 80;
                if (Math.abs(InflowX - x) * this.GridToCanvas > dis && Math.abs(InflowY - y) * this.GridToCanvas > dis) {
                    this.Villages.push(new Village(x, y, this.VillageSize, this.VillageSize,this));
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
            var SeedZ = (Math.random() * 10);
            var SeedXR = (Math.random() * 100);
            var SeedYR = (Math.random() * 6);
            var SeedZR = (Math.random() * 5);
            var XLow = 0;
            var YLow = 0;
            var Low = -1;
            for (var x = 0; x < this.GroundHeight.SizeX; ++x) {
                for (var y = 0; y < this.GroundHeight.SizeY; ++y) {
                    this.RockHeight.SetValueAt(x, y, Math.max(0, (this.MountainGen(x, y, SeedXR, SeedYR, SeedZR))));
                    this.GroundHeight.SetValueAt(x, y, (this.SlopeGen(x, y) + this.VallyGen(x, y, SeedX, SeedY, SeedZ)));
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
                var x = Math.round(Math.random() * (this.WorldSize - (this.VillageSize + 1)));
                var y = Math.round(Math.random() * (this.WorldSize - (this.VillageSize + 1)));
                var dis = 80;
                if (Math.abs(InflowX - x) * this.GridToCanvas > dis && Math.abs(InflowY - y) * this.GridToCanvas > dis) {
                    this.Villages.push(new Village(x, y,this.VillageSize,this.VillageSize, this));
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
            this.WorldGenClassic(InflowX, InflowY);
            var Corners = [[0, this.WorldSize], [this.WorldSize, 0]];
            for (var i = 0; i < 2; ++i) {
                var x = Math.round(Math.random() * (this.WorldSize - (this.VillageSize + 1)));
                var y = Math.round(Math.random() * (this.WorldSize - (this.VillageSize + 1)));
                var dis = 100;
                var disV = 300;
                if (Math.abs(InflowX - x) * this.GridToCanvas > dis && Math.abs(InflowY - y) * this.GridToCanvas > dis && Math.abs(Corners[i][0] - x) * this.GridToCanvas < disV && Math.abs(Corners[i][1] - y) * this.GridToCanvas < disV) {
                    this.Villages.push(new Village(x, y, this.VillageSize, this.VillageSize, this));
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
                    if (this.GroundType.GetValueAt(x, y) == -2) {
                        var Factor = 100;
                        //var Waves = Math.max(0, (Math.sin((this.Time - this.StartTime) / Factor) * (this.Time - this.StartTime) / (Factor * Math.PI)));
                        //var Waves = Math.max(0,(0.49 * this.Time * Math.sin(this.Time)) + (0.5 * this.Time));
                        var Waves = (this.Time - this.StartTime) * this.GridToCanvas;
                        var IFlow = Waves * this.Inflow;
                        //document.getElementById("Flow").innerHTML = IFlow.toString();
                        this.WaterHeight.AddValueAt(x, y, IFlow);
                        this.SiltMap.AddValueAt(x, y, this.SedimentCapacityConst);
                    }
                    if (this.GroundType.GetValueAt(x, y) == -3) {
                        //this.TotalOutFlow += Math.max(0,this.WaterHeight.GetValueAt(x,y) - this.OutFlow * this.DeltaTime);
                        this.WaterHeight.AddValueAt(x, y, -this.OutFlow * this.DeltaTime);
                    }
                    if (this.GroundType.GetValueAt(x, y) == 1 && this.WaterHeight.GetValueAt(x, y) > 0) {
                        //this.GroundType.SetValueAt(x, y, 0);
                        //this.HousesRemaining -= 1;
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
                    //Each cell is connected to 4 others
                    var WaterHeight = this.WaterHeight.RawGrid[(x * this.GroundHeight.SizeX) + y];
                    if (WaterHeight > 0) {
                        var TotalFlow = 0
                        var SizeX = this.GroundHeight.SizeX;
                        var ThisHeight = (this.GroundHeight.RawGrid[(x * SizeX) + y] + this.WaterHeight.RawGrid[(x * SizeX) + y] + this.RockHeight.RawGrid[(x * SizeX) + y]);
                        for (var i = 0; i < this.SearchSpace.length; ++i) {
                            var Offset = this.SearchSpace[i];
                            if (!(x + Offset[0] < 0 || y + Offset[1] < 0 || x + Offset[0] >= SizeX || y + Offset[1] >= this.WaterHeight.SizeY)) {
                                var HeightDifference = ThisHeight - (this.GroundHeight.RawGrid[((x + Offset[0]) * SizeX) + (y + Offset[1])] + this.WaterHeight.RawGrid[((x + Offset[0]) * SizeX) + (y + Offset[1])] + this.RockHeight.RawGrid[((x + Offset[0]) * SizeX) + (y + Offset[1])]);
                                var Flow = Math.max(0, this.OutFlowMap[i].RawGrid[(x * SizeX) + y] + (this.DeltaTime * this.PipeCrossSection * ((this.Gravity * HeightDifference) / this.PipeLength)));
                                TotalFlow += Flow;
                                this.OutFlowMap[i].SetValueAt(x, y, Flow);
                            }
                        }
                        if (TotalFlow > WaterHeight) {
                            var KScale = Math.min(1, WaterHeight / (TotalFlow));
                            for (var i = 0; i < this.SearchSpace.length; ++i) {
                                var NewOutFlow = this.OutFlowMap[i].RawGrid[(x * SizeX) + y] * KScale;
                                this.OutFlowMap[i].SetValueAt(x, y, NewOutFlow);
                            }
                        }
                    }
                    else {
                        for (var i = 0; i < this.SearchSpace.length; ++i) {
                            this.OutFlowMap[i].SetValueAt(x, y, 0);
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
                        VolumeOut += this.OutFlowMap[i].GetValueAt(x, y);
                    }
                    var VolumeNet = this.DeltaTime * (VolumeIn - VolumeOut);
                    this.WaterHeightBuffer.SetValueAt(x, y, this.WaterHeight.GetValueAt(x, y) + VolumeNet);
                }
            }
            //this.WaterHeight.Set(this.WaterHeightBuffer);
            //this.WaterHeightBuffer.Fill(0);
        }
        public UpdateSandSlumping() {
            for (var x = 0; x < this.GroundHeight.SizeX; ++x) {
                for (var y = 0; y < this.GroundHeight.SizeY; ++y) {
                    var NetVolume = 0
                    //var SearchSpaceSmall = [[1, 0], [0, 1]];
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
            //this.GroundHeight.Set(this.GroundHeightBuffer);
            //this.GroundHeightBuffer.Fill(0);
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
                        else {
                            this.SiltMapBuffer.SetValueAt(x, y, this.SiltMap.GetValueAt(x - OffsetX, y - OffsetY));
                        }
                    }
                }
            }
            //Flip Silt buffer
            //this.SiltMap.Set(this.SiltMapBuffer);
            //this.SiltMapBuffer.Fill(0);
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
                        if (this.GroundHeightBuffer.GetValueAt(x, y) - ChangeSilt < 0) {
                            ChangeSilt = this.GroundHeightBuffer.GetValueAt(x, y);
                        }
                        this.GroundHeightBuffer.AddValueAt(x, y,- ChangeSilt);
                        this.SiltMapBuffer.SetValueAt(x, y, Silt + ChangeSilt);
                    }
                    else if (Capacity <= this.SiltMap.GetValueAt(x, y)) {
                        var ChangeSilt = this.SedimentDepositingConst * (Silt - Capacity);
                        if (this.SiltMap.GetValueAt(x, y) - ChangeSilt < 0) {
                            ChangeSilt = this.SiltMap.GetValueAt(x, y);
                        }
                        this.GroundHeightBuffer.AddValueAt(x, y, ChangeSilt);
                        this.SiltMapBuffer.SetValueAt(x, y, Silt - ChangeSilt);
                    }
                }
            }
            //this.GroundHeight.Set(this.GroundHeightBuffer);
            //this.GroundHeightBuffer.Fill(0);
            //this.SiltMap.Set(this.SiltMapBuffer);
            //this.SiltMapBuffer.Fill(0);
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
        UpdateVillages() {
            for (var i = 0;i < this.Villages.length; ++i) {
                this.Villages[i].Update(this);
            }
        }
        Update() {
            this.Time += this.DeltaTime / (this.GameTimeScale*1000);
            for (var i = 0; i < this.UpdatePerTick; ++i) {
                if (this.Time >= this.StartTime) { this.UpdateWorldFlow(); }
                this.UpdateVillages();
                this.UpdateWater();
                this.UpdateVelocity();
                this.UpdateSilting();
                this.UpdateSiltTransport();
                this.UpdateSandSlumping();
                this.FlipBuffers();
            }
            //this.Inflow += 1;
        }
        FlipBuffers() {
            this.WaterHeight.Set(this.WaterHeightBuffer);
            this.WaterHeightBuffer.Fill(0);
            this.GroundHeight.Set(this.GroundHeightBuffer);
            this.GroundHeightBuffer.Fill(0);
            this.SiltMap.Set(this.SiltMapBuffer);
            this.SiltMapBuffer.Fill(0);
        }
        RenderBoarder(xo = 0) {
            var Boarder = 2;
            this.Guictx.beginPath();
            this.Guictx.rect(1, 1, this.GuiCanvas.width - (Boarder + xo), this.GuiCanvas.height - Boarder);
            this.Guictx.lineWidth = 2;
            this.Guictx.strokeStyle = 'black';
            this.Guictx.stroke();
        }
        RenderHTMLCanvas() {
            this.RenderctxHTML.fillStyle = "#FFFFFF";
            this.RenderctxHTML.clearRect(0, 0, this.RenderCanvas.width, this.RenderCanvas.height);
            for (var x = 0; x < this.GroundHeight.SizeX; ++x) {
                for (var y = 0; y < this.GroundHeight.SizeY; ++y) {
                    //FFC877 Sand brightest.

                    var BrightnessDec = Math.min(1, Math.max(0.1, (this.GroundHeight.GetValueAt(x, y) + this.RockHeight.GetValueAt(x, y)) / (this.GroundHeight.MaxHeight + this.RockHeight.MaxHeight)));
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
                    this.RenderctxHTML.fillStyle = "#" + fillR + fillG + fillB;
                    this.RenderctxHTML.fillRect(x * this.GridToCanvas, y * this.GridToCanvas, this.GridToCanvas, this.GridToCanvas);
                }
            }
        }
        RenderWebGL() {
            //Update Colour
            if (this.ShaderType == 2) {
                this.RenderctxGL.activeTexture(this.RenderctxGL.TEXTURE0);
                this.RenderctxGL.bindTexture(this.RenderctxGL.TEXTURE_2D, this.ColourTexture);
                this.RenderctxGL.uniform1i(this.RenderctxGL.getUniformLocation(this.ShaderProgram, "uSampler"), 0);
            }
            for (var x = 0; x < this.WorldSize; ++x) {
                for (var y = 0; y < this.WorldSize; ++y) {
                    var id = (y + (x * this.WorldSize)) * 4;
                    var BrightnessDec = Math.min(1, Math.max(0.1, (this.GroundHeight.GetValueAt(x, y) + this.RockHeight.GetValueAt(x, y)) / (this.GroundHeight.MaxHeight + this.RockHeight.MaxHeight)));
                    var R = BrightnessDec;
                    var G = BrightnessDec;
                    var B = BrightnessDec;
                    if (this.GroundHeight.GetValueAt(x, y) > 0.1) {
                        R *= 1;//255
                        G *= 0.78;//200
                        B *= 0.47;//129
                    }
                    else {
                        R *= 0.5;//123/255
                        G *= 0.5;//123/255
                        B *= 0.5;//123/255
                    }
                    if (this.WaterHeight.GetValueAt(x, y) > 0) {
                        //00D4FF Water
                        var BrightnessDecWater = 1 - (this.WaterHeight.GetValueAt(x, y) / (0.5 * this.WaterHeight.MaxHeight));
                        //BrightnessDecWater = Math.max(0, Math.min(1, BrightnessDecWater))
                        R /= 2;//R = 0
                        G += 0.83 * BrightnessDecWater;//212/255
                        G /= Math.max(2, Math.ceil(G));
                        B += 1;//255
                        B /= Math.max(2, Math.ceil(G));
                    }
                    if (R > 1) { R = 1; }
                    if (G > 1) { G = 1; }
                    if (B > 1) { B = 1; }
                    if (this.ShaderType == 2) {
                        this.TextureData[id] = R;
                        this.TextureData[id + 1] = G;
                        this.TextureData[id + 2] = B;
                        this.TextureData[id + 3] = this.GroundType.GetValueAt(x, y);
                    }
                    else {
                        this.ColourArray[id] = R;
                        this.ColourArray[id + 1] = G;
                        this.ColourArray[id + 2] = B;
                        this.ColourArray[id + 3] = this.GroundType.GetValueAt(x, y);
                    }
                }
            }
            if (this.ShaderType == 2) {
                this.RenderctxGL.texImage2D(this.RenderctxGL.TEXTURE_2D, 0, this.RenderctxGL.RGBA, 1, 1, 0, this.RenderctxGL.RGBA, this.RenderctxGL.UNSIGNED_BYTE, this.TextureData);
            }
            else {
                this.RenderctxGL.bufferData(this.RenderctxGL.ARRAY_BUFFER, this.ColourArray, this.RenderctxGL.STREAM_DRAW);
            }
            //Render
            this.RenderctxGL.clear(this.RenderctxGL.COLOR_BUFFER_BIT | this.RenderctxGL.DEPTH_BUFFER_BIT);
            this.RenderctxGL.bindBuffer(this.RenderctxGL.ARRAY_BUFFER, this.GridVertexBuffer);
            this.RenderctxGL.vertexAttribPointer(this.VertexPos, 2, this.RenderctxGL.FLOAT, false, 0, 0);
            if (this.ShaderType != 2) {
                this.RenderctxGL.bindBuffer(this.RenderctxGL.ARRAY_BUFFER, this.GridColourBuffer);
                this.RenderctxGL.vertexAttribPointer(this.ColourPos, 4, this.RenderctxGL.FLOAT, false, 0, 0);
            }
            this.RenderctxGL.bindBuffer(this.RenderctxGL.ELEMENT_ARRAY_BUFFER, this.GridIndexBuffer);
            this.RenderctxGL.drawElements(this.RenderctxGL.TRIANGLES,this.GridIndexBufferSize,this.RenderctxGL.UNSIGNED_SHORT,0 );
            //this.RenderctxGL.drawArrays(this.RenderctxGL.TRIANGLE_STRIP, 0, 3);
        }
        DeltaTimeCalculate() {
            var rtime = Date.now();
            this.DeltaTime = rtime - this.RealTime;
            this.DeltaTime *= this.GameTimeScale;//This was due to issues
            this.RealTime = rtime;
            if (this.DeltaTime > 1) {
                //this.DeltaTime = 1;//Erm plz
            }
        }
        Render() {
            if (this.WillRenderWebGL) {
                this.RenderWebGL();
            }
            else {
                this.RenderHTMLCanvas();
            }
            this.RenderBoarder(100);
        }
        PollInput() {
            var DeltaHeight = 0;
            var HeightPerSecond = 40;
            if (MouseButton == 1) { //DeltaHeight = -HeightPerSecond; }
                //document.getElementById("out").innerHTML = this.WaterHeight.GetValueAt(MouseChunkX, MouseChunkY).toString() + ":Water ," + this.GroundHeight.GetValueAt(MouseChunkX, MouseChunkY) + ":Ground," + (this.SiltMap.GetValueAt(MouseChunkX, MouseChunkY) / (this.SedimentCapacityConst * this.WaterHeight.GetValueAt(MouseChunkX, MouseChunkY))) + "%:Silts";

            }
            var Direction = 0;
            if (MouseButton == 0) {
                Direction = -this.SandDiggingSpeed;
            }
            if (MouseButton == 2) {
                Direction = this.SandPlacingSpeed;
            }
            if (Direction != 0) {
                this.ManipulateSand(MouseChunkX, MouseChunkY, Math.round(this.SandDiggingSize/this.GridToCanvas), Direction, 0.7);
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
            if (this.GroundType.GetValueAt(X,Y) != 0) { return false; }
            return true;
        }
        public ManipulateSand(ChunkX: number, ChunkY: number, Size: number, Direction: number, factor: number) {
            //console.log([ChunkX, ChunkY].join(","));
            var SizeOffset = Size / 2;
            var Area = 0;
            var Factor = factor * this.DeltaTime;
            var Depth = 0;
            if (Direction > 0) {
                Depth = 15;
            }
            var Min = -this.DistributionFunction(-SizeOffset, 0);
            for (var xo = 0; xo < Size; ++xo) {
                var X = Math.round(ChunkX + (xo - SizeOffset));
                for (var yo = 0; yo < Size; ++yo) {
                    var Y = Math.round(ChunkY + (yo - SizeOffset));
                    if (this.CanDig(X, Y, xo, yo, SizeOffset, Min, Depth)) {
                        Area += this.DistributionFunction(xo - SizeOffset, yo - SizeOffset) + Min;
                    }
                }
            }
            if (Factor * Area * Direction> this.PickedUpSand) {
                Factor = (this.PickedUpSand / Area) * this.DeltaTime;
            }
            for (var xo = 0; xo < Size; ++xo) {
                var X = Math.round(ChunkX + (xo - SizeOffset));
                for (var yo = 0; yo < Size; ++yo) {
                    var Y = Math.round(ChunkY + (yo - SizeOffset));
                    if (this.CanDig(X, Y, xo, yo, SizeOffset, Min, Depth)) {
                        //Simulate
                        var Distribution = this.DistributionFunction(xo - SizeOffset, yo - SizeOffset) + Min;
                        Distribution = (Direction * Distribution * Factor);// / (Area);
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
                        if (Math.abs(Distribution) < 0.1) {
                            Distribution = 0;
                        }
                        this.GroundHeight.AddValueAt(X, Y, Distribution);
                        this.PickedUpSand -= Distribution;
                    }
                }
            }
        }
        public MainLoop() {
            switch (this.GameState) {
                case 0://MainMenu
                    this.Guictx.clearRect(0, 0, this.GuiCanvas.width, this.GuiCanvas.height);
                    this.MainMenu.Update(MouseX, MouseY, MouseButton);
                    this.MainMenu.Render();
                    if ((<Button>this.MainMenu.Elements[1]).State == 2) {
                        this.GotoGameSelection();
                    }
                    if ((<Button>this.MainMenu.Elements[3]).State == 2) {
                        this.GotoCredits();
                    }
                    if ((<Button>this.MainMenu.Elements[5]).State == 2) {
                        this.InitGL();
                    }
                    ///this.MainMenu.Update(MouseX, MouseY, MouseButton);
                    break;
                case 1://Game
                    this.DeltaTimeCalculate();
                    this.Guictx.clearRect(0, 0, this.GuiCanvas.width, this.GuiCanvas.height);
                    (<Lable>this.Hud.Elements[5]).Text = Math.ceil(this.Time).toString();
                    (<Lable>this.Hud.Elements[7]).Text = this.PickedUpSand.toString();
                    (<Lable>this.Hud.Elements[9]).Text = this.HousesRemaining.toString();
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
                    this.Guictx.clearRect(0, 0, this.GuiCanvas.width, this.GuiCanvas.height);
                    (<Lable>this.LoseScreen.Elements[5]).Text = "You lasted a time of:" + (this.Time.toFixed(0)).toString();
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
                    this.Guictx.clearRect(0, 0, this.GuiCanvas.width, this.GuiCanvas.height);
                    this.GameSelection.Update(MouseX, MouseY, MouseButton);
                    this.GameSelection.Render();
                    if ((<Button>this.GameSelection.Elements[3]).State == 2) {
                        this.InitGame();
                    }
                    if ((<DropDown>this.GameSelection.Elements[5]).OptionSelected == 0) {
                        this.SetGameSelectionCustom(false);
                    }
                    else {
                        this.SetGameSelectionCustom(true);
                    }
                    this.GameSelectionCustom.Update(MouseX, MouseY, MouseButton);
                    this.GameSelectionCustom.Render();
                    ///this.GameSelection.Update(MouseX, MouseY, MouseButton);
                    break;
                case 4://Credits
                    this.Guictx.clearRect(0, 0, this.GuiCanvas.width, this.GuiCanvas.height);
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
    //export var world = null;
    var UpdateSpeed = 10;
    //world.MainLoop();
    function Start() {
        console.log("world defined");
        world = new World();
        var Interval = 0;
        document.onmousemove = function (event: MouseEvent) {
            MouseX = event.pageX - world.GuiCanvas.offsetLeft;
            MouseY = event.pageY - world.GuiCanvas.offsetTop;
            MouseChunkX = Math.floor((event.pageX - world.GuiCanvas.offsetLeft) / world.GridToCanvas);
            MouseChunkY = Math.floor((event.pageY - world.GuiCanvas.offsetTop) / world.GridToCanvas);
        };
        document.onmousedown = function (event: MouseEvent) {
            MouseButton = event.button;
            return true;
        };
        document.onmouseup = function (event: MouseEvent) {
            MouseButton = -1;
            return true;
        };
        Interval = setInterval(function () { world.MainLoop(); }, UpdateSpeed);
    }
    Start();
}