var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
/// <refrence href="WebGL.d.ts">
/*Version 1.3.1 rel
Bug List:
*/
var Pipe;
(function (Pipe) {
    var Grid = (function () {
        function Grid(x, y, d) {
            if (typeof d === "undefined") { d = 0; }
            this.SizeX = 100;
            this.SizeY = 100;
            this.SizeTotal = this.SizeX * this.SizeY;
            this.MaxHeight = 50;
            this.Averadge = 0;
            this.SizeX = x;
            this.SizeY = y;
            this.RawGrid = new Float64Array(x * y);
            if (d != 0) {
                for (var i = 0; i < x * y; ++i) {
                    this.RawGrid[i] = d;
                }
            }
        }
        Grid.prototype.GetValueAt = function (x, y) {
            if (x >= 0 && x < this.SizeX) {
                if (y >= 0 && y < this.SizeY) {
                    return this.RawGrid[(x * this.SizeX) + y];
                }
            }
            return -1;
        };
        Grid.prototype.SetValueAt = function (x, y, v) {
            if (x >= 0 && x < this.SizeX) {
                if (y >= 0 && y < this.SizeY) {
                    if (v > this.MaxHeight) {
                        v = this.MaxHeight;
                    }
                    this.RawGrid[(x * this.SizeX) + y] = v;
                }
            }
        };
        Grid.prototype.AddValueAt = function (x, y, v) {
            if (x >= 0 && x < this.SizeX) {
                if (y >= 0 && y < this.SizeY) {
                    this.RawGrid[(x * this.SizeX) + y] += v;
                    if (this.RawGrid[(x * this.SizeX) + y] > this.MaxHeight && this.MaxHeight != -1) {
                        this.RawGrid[(x * this.SizeX) + y] = this.MaxHeight;
                    }
                }
            }
        };
        Grid.prototype.GetMean = function () {
            var avr = 0;
            for (var i = 0; i < this.SizeX * this.SizeY; ++i) {
                avr += this.RawGrid[i];
            }
            avr /= this.SizeX * this.SizeY;
            this.Averadge = avr;
            return avr;
        };
        return Grid;
    })();
    ;
    var Element = (function () {
        function Element(z) {
            if (typeof z === "undefined") { z = 0; }
            this.Active = true;
            this.Z = 0;
            this.Z = z;
        }
        Element.prototype.Remove = function (gui) {
        };
        Element.prototype.Update = function (gui) {
        };
        Element.prototype.Render = function (gui) {
        };
        return Element;
    })();
    var Button = (function (_super) {
        __extends(Button, _super);
        function Button(gui, x, y, sx, sy, txt, fsize, c, z) {
            if (typeof fsize === "undefined") { fsize = 30; }
            if (typeof c === "undefined") { c = true; }
            if (typeof z === "undefined") { z = 0; }
            _super.call(this, z);
            this.X = 0;
            this.Y = 0;
            this.SizeX = 0;
            this.SizeY = 0;
            this.State = 0;
            this.Centered = true;
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
        Button.prototype.Remove = function (gui) {
            _super.prototype.Remove.call(this, gui);
            gui.RemoveElement(this.Text);
        };
        Button.prototype.Render = function (gui) {
            if (this.State == 0) {
                gui.ctx.fillStyle = "#FF00FF";
            } else if (this.State == 1) {
                gui.ctx.fillStyle = "#CC00FF";
            } else if (this.State == 2) {
                gui.ctx.fillStyle = "#FF55FF";
            }
            gui.ctx.fillRect(this.X, this.Y, this.SizeX, this.SizeY);
            //this.Text.Render(gui);
        };
        Button.prototype.Update = function (gui) {
            if (gui.MouseX > this.X && gui.MouseX < this.X + this.SizeX && gui.MouseY > this.Y && gui.MouseY < this.Y + this.SizeY) {
                if (gui.Button == 0) {
                    if (this.State == 0) {
                        this.State = 1;
                    }
                } else {
                    if (this.State == 1) {
                        this.State = 2;
                    } else {
                        this.State = 0;
                    }
                }
            } else {
                this.State = 0;
            }
        };
        return Button;
    })(Element);
    var Lable = (function (_super) {
        __extends(Lable, _super);
        function Lable(x, y, txt, size, c, z) {
            if (typeof size === "undefined") { size = 30; }
            if (typeof c === "undefined") { c = true; }
            if (typeof z === "undefined") { z = 0; }
            _super.call(this, z);
            this.X = 0;
            this.Y = 0;
            this.Text = "";
            this.FontSize = 30;
            this.Centered = true;
            this.X = x;
            this.Y = y;
            this.Text = txt;
            this.FontSize = size;
            this.Centered = c;
        }
        Lable.prototype.Render = function (gui) {
            gui.ctx.fillStyle = "#000000";
            gui.ctx.font = this.FontSize.toString() + "px Arial";
            var x = this.X;
            var y = this.Y;
            if (this.Centered) {
                x = this.X - ((this.Text.length - 1) * (this.FontSize / 4));
                y = this.Y + (this.FontSize * 0.5 / 2);
            }
            gui.ctx.fillText(this.Text, x, y);
        };
        return Lable;
    })(Element);
    var DropDown = (function (_super) {
        __extends(DropDown, _super);
        function DropDown(gui, x, y, sx, sy, options, fsize, c, z) {
            if (typeof fsize === "undefined") { fsize = 30; }
            if (typeof c === "undefined") { c = true; }
            if (typeof z === "undefined") { z = 0; }
            _super.call(this, gui, x, y, sx, sy, options[0], fsize, c, z);
            this.OptionsNonDisplay = [];
            this.OptionButtons = [];
            this.OptionSelected = 0;
            this.Droped = false;
            this.Options = options;
            this.OptionsNonDisplay = this.Options.slice(0, this.Options.length);
            this.OptionsNonDisplay.shift();
        }
        DropDown.prototype.Drop = function (gui) {
            this.Droped = true;
            for (var i = 0; i < this.OptionsNonDisplay.length; ++i) {
                this.OptionButtons.push(new Button(gui, this.X, this.Y + (this.SizeY * (i + 1)), this.SizeX, this.SizeY, this.OptionsNonDisplay[i], this.Text.FontSize, this.Centered, this.Z + 2));
                gui.AddElement(this.OptionButtons[i]);
            }
        };
        DropDown.prototype.Select = function (Selected, gui) {
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
        };
        DropDown.prototype.Remove = function (gui) {
            for (var i = 0; i < this.OptionButtons.length; ++i) {
                gui.RemoveElement(this.OptionButtons[i]);
            }
        };
        DropDown.prototype.Update = function (gui) {
            _super.prototype.Update.call(this, gui);
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
            } else {
                if (this.State == 2) {
                    this.Drop(gui);
                }
            }
        };
        return DropDown;
    })(Button);
    var Gui = (function () {
        function Gui(ctx, width, height) {
            this.MouseX = 0;
            this.MouseY = 0;
            this.Button = -1;
            this.Width = 0;
            this.Height = 0;
            this.Active = true;
            this.Elements = [];
            this.RenderList = [];
            this.ctx = ctx;
            this.Width = width;
            this.Height = height;
            for (var i = 0; i < 10; ++i) {
                this.RenderList[i] = new Array();
            }
        }
        Gui.prototype.AddElement = function (element) {
            this.Elements.push(element);
            this.RenderList[element.Z].push(element);
        };
        Gui.prototype.RemoveElement = function (element) {
            element.Remove(this);
            this.Elements.splice(this.Elements.indexOf(element), 1);
            this.RenderList[element.Z].splice(this.RenderList[element.Z].indexOf(element), 1);
        };
        Gui.prototype.Update = function (mx, my, b) {
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
        };
        Gui.prototype.Render = function () {
            if (this.Active) {
                for (var i = 0; i < this.RenderList.length; ++i) {
                    for (var j = 0; j < this.RenderList[i].length; ++j) {
                        if (this.RenderList[i][j].Active) {
                            this.RenderList[i][j].Render(this);
                        }
                    }
                }
            }
        };
        return Gui;
    })();
    console.log("Grid defined");
    var World = (function () {
        function World() {
            this.CanRenderWebGL = true;
            this.GridVertexBuffer = null;
            this.GridColourBuffer = null;
            this.GridIndexBuffer = null;
            this.PickedUpSand = 0;
            this.GameState = 0;
            this.GridToCanvas = 4;
            this.PlaySize = 500;
            this.WorldSize = this.PlaySize / this.GridToCanvas;
            this.StartTime = 100;
            this.Time = 0;
            this.RealTime = 0;
            this.HighScore = 0;
            this.Map = 0;
            this.MaxSand = 6000;
            ///Sim values
            this.DeltaTime = 1;
            this.GameTimeScale = 1 / 70;
            this.Gravity = 10;
            this.PipeLength = 1;
            this.PipeCrossSection = 0.01;
            this.UpdatePerTick = 2;
            this.SedimentDepositingConst = 1;
            this.SedimentDissolvingConst = 1;
            this.SedimentCapacityConst = 0.01;
            this.Inflow = 100;
            this.OutFlow = 1000;
            this.MaxOutFlow = 100;
            this.SlumpConst = 0.03;
            this.SlumpLimitDry = 10;
            this.SlumpLimitWet = 0;
            ////Sim buffers
            this.GroundType = new Grid(this.WorldSize, this.WorldSize);
            this.WaterHeight = new Grid(this.WorldSize, this.WorldSize);
            this.WaterHeightBuffer = new Grid(this.WorldSize, this.WorldSize);
            this.RockHeight = new Grid(this.WorldSize, this.WorldSize, 1);
            this.GroundHeight = new Grid(this.WorldSize, this.WorldSize, 1);
            this.GroundHeightBuffer = new Grid(this.WorldSize, this.WorldSize, 1);
            //public InFlowMap: Array<Grid>;
            this.OutFlowMap = [];
            this.VelocityMapX = new Grid(this.WorldSize, this.WorldSize);
            this.VelocityMapY = new Grid(this.WorldSize, this.WorldSize);
            this.SiltMap = new Grid(this.WorldSize, this.WorldSize);
            this.SiltMapBuffer = new Grid(this.WorldSize, this.WorldSize);
            this.SearchSpace = [[1, 0], [0, 1], [-1, 0], [0, -1]];
            this.Init();
            this.GotoMainMenu();
            //this.InitGuis();
        }
        World.prototype.Init = function () {
            this.GuiCanvas = document.getElementById("GuiCanvas");
            this.RenderCanvas = document.getElementById("RenderCanvas");
            this.GuiCanvas.width = (this.PlaySize) + 100;
            this.GuiCanvas.height = (this.PlaySize);
            this.RenderCanvas.width = (this.PlaySize);
            this.RenderCanvas.height = (this.PlaySize);
            this.Guictx = this.GuiCanvas.getContext("2d");
            this.InitRenderCanvas();
            if (this.CanRenderWebGL) {
                this.InitGL();
            }
        };
        World.prototype.InitRenderCanvas = function () {
            try  {
                this.RenderctxGL = this.RenderCanvas.getContext("webgl") || this.RenderCanvas.getContext("experimental-webgl");
                this.RenderctxGL.viewport(0, 0, this.RenderCanvas.width, this.RenderCanvas.height);
            } catch (e) {
                console.log(e);
            }
            if (!this.RenderctxGL) {
                console.log("Could not initialise WebGL");
                this.CanRenderWebGL = false;
                this.RenderctxHTML = this.RenderCanvas.getContext("2d");
            }
        };
        World.prototype.InitGL = function () {
            //Shaders e.g.
            this.InitShaders();
            this.RenderctxGL.clearColor(0.0, 0.0, 0.0, 1.0);
            this.RenderctxGL.enable(this.RenderctxGL.DEPTH_TEST);
        };
        World.prototype.ResetGL = function () {
            //Buffers e.g.
            this.InitBuffers();
        };
        World.prototype.GetShader = function (gl, id) {
            var shaderScript = document.getElementById(id);
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
            console.log("Compiling Shader " + shaderScript.type);
            gl.shaderSource(shader, str);
            gl.compileShader(shader);
            if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
                console.log(gl.getShaderInfoLog(shader));
                return null;
            }
            return shader;
        };

        World.prototype.InitShaders = function () {
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
        };
        World.prototype.InitBuffers = function () {
            var vertices = [
                0, 1.0,
                -1.0, -1.0,
                1.0, -1.0
            ];
            var Colours = [
                1, 0, 0.0, 0.0,
                1.0, 0.5, 0.0,
                1.0, -1.0, 0.0
            ];
            if (this.GridVertexBuffer != null) {
                this.RenderctxGL.deleteBuffer(this.GridVertexBuffer);
            }

            this.GridVertexBuffer = this.RenderctxGL.createBuffer();
            this.RenderctxGL.bindBuffer(this.RenderctxGL.ARRAY_BUFFER, this.GridVertexBuffer);
            var HalfPlaySize = this.PlaySize / 2;
            for (var x = 0; x < this.WorldSize; ++x) {
                for (var y = 0; y < this.WorldSize; ++y) {
                    //vertices.push((x * this.GridToCanvas/HalfPlaySize)-1, (y * this.GridToCanvas/HalfPlaySize)-1);
                }
            }
            this.RenderctxGL.bufferData(this.RenderctxGL.ARRAY_BUFFER, new Float32Array(vertices), this.RenderctxGL.STATIC_DRAW);

            //
            this.GridColourBuffer = this.RenderctxGL.createBuffer();
            this.RenderctxGL.bindBuffer(this.RenderctxGL.ARRAY_BUFFER, this.GridColourBuffer);
            for (var x = 0; x < this.WorldSize; ++x) {
                for (var y = 0; y < this.WorldSize; ++y) {
                    //Colours.push((x * this.GridToCanvas / this.PlaySize), (y * this.GridToCanvas / this.PlaySize),1);
                }
            }
            this.RenderctxGL.bufferData(this.RenderctxGL.ARRAY_BUFFER, new Float32Array(Colours), this.RenderctxGL.STATIC_DRAW);
        };

        World.prototype.InitGame = function () {
            this.PickedUpSand = 0;
            this.Time = 0;

            if (this.CanRenderWebGL) {
                this.GridToCanvas = 4;
                this.PlaySize = 500;
                this.WorldSize = (this.PlaySize / this.GridToCanvas) + 1;
            } else {
                this.GridToCanvas = 4;
                this.PlaySize = 500;
                this.WorldSize = this.PlaySize / this.GridToCanvas;
            }

            this.GroundType = new Grid(this.WorldSize, this.WorldSize); //0 = sand,1 = Obstruction, 2 is 'Source', 3 is 'Sink'
            this.WaterHeight = new Grid(this.WorldSize, this.WorldSize);
            this.WaterHeightBuffer = new Grid(this.WorldSize, this.WorldSize);
            this.RockHeight = new Grid(this.WorldSize, this.WorldSize, 1);
            this.GroundHeight = new Grid(this.WorldSize, this.WorldSize);
            this.GroundHeightBuffer = new Grid(this.WorldSize, this.WorldSize);
            this.OutFlowMap = [];
            this.VelocityMapX = new Grid(this.WorldSize, this.WorldSize);
            this.VelocityMapY = new Grid(this.WorldSize, this.WorldSize);
            this.SiltMap = new Grid(this.WorldSize, this.WorldSize);
            this.SiltMapBuffer = new Grid(this.WorldSize, this.WorldSize);
            this.WaterHeight.MaxHeight = 200;
            this.WaterHeightBuffer.MaxHeight = this.WaterHeight.MaxHeight;
            this.SiltMap.MaxHeight = 1000;
            this.SiltMapBuffer.MaxHeight = this.SiltMap.MaxHeight;
            for (var i = 0; i < 4; ++i) {
                this.OutFlowMap[i] = new Grid(this.WorldSize, this.WorldSize);
            }
            this.Map = this.GameSelection.Elements[1].OptionSelected;
            if (this.Map == 0) {
                this.HousesRemaining = 5;
                this.MaxSand = 6000;
                this.WorldGenClassic();
            }
            if (this.Map == 1) {
                this.HousesRemaining = 20;
                this.MaxSand = 6000;
                this.WorldGenClassic();
                this.HousesRemaining = 15;
            }
            if (this.Map == 2) {
                this.MaxSand = 7000;
                this.WorldGenTwoVillages();
            }
            if (this.Map == 3) {
                this.WorldGenTwoVillages();
            }
            if (this.Map == 4) {
                this.WorldGenTwoVillages();
            }
            if (this.Map == 5) {
                this.MaxSand = 5000;
                this.HousesRemaining = 5;
                this.WorldGenMountains();
            }
            if (this.CanRenderWebGL) {
                this.ResetGL();
            }
            this.GotoHUD();
        };
        World.prototype.GotoMainMenu = function () {
            this.GameState = 0;
            this.MainMenu = new Gui(this.Guictx, this.PlaySize, this.PlaySize);
            this.MainMenu.AddElement(new Button(this.MainMenu, this.PlaySize / 2, 100, 100, 50, "Start", 30)); //1
            this.MainMenu.AddElement(new Button(this.MainMenu, this.PlaySize / 2, 200, 100, 50, "Credits")); //3
        };
        World.prototype.GotoGameSelection = function () {
            this.GameState = 3;
            this.GameSelection = new Gui(this.Guictx, this.PlaySize, this.PlaySize);
            this.GameSelectionCustom = new Gui(this.Guictx, this.PlaySize, this.PlaySize);
            this.GameSelection.AddElement(new DropDown(this.GameSelection, 0, 0, 150, 50, ["Classic", "Many Villages", "Two Villages", "Geyser of Death", "4 Corners", "Mountains"], 15, false)); //1
            this.GameSelection.AddElement(new Button(this.GameSelection, 0, 100, 100, 50, "Start")); //3
            this.GameSelection.AddElement(new DropDown(this.GameSelection, 170, 0, 90, 50, ["Defualt", "Custom"], 15, false)); //5
        };
        World.prototype.SetGameSelectionCustom = function (State) {
            if (!State) {
                this.GameSelectionCustom.Active = false;
            } else {
                this.GameSelectionCustom = new Gui(this.Guictx, this.PlaySize, this.PlaySize);

                //this.GameSelectionCustom.AddElement(new DropDown(this.GameSelectionCustom, 0, 0, 150, 50, ["Classic", "Many Villages", "Two Villages", "Geyser of Death", "4 Corners", "Mountains"], 15, false));//1
                this.GameSelectionCustom.AddElement(new Button(this.GameSelectionCustom, 200, 100, 100, 50, "Start")); //3
                //this.GameSelectionCustom.AddElement(new DropDown(this.GameSelectionCustom, 170, 0, 90, 50, ["Defualt", "Custom"], 15, false));//1
            }
        };
        World.prototype.GotoHUD = function () {
            this.GameState = 1;
            this.Hud = new Gui(this.Guictx, this.PlaySize, this.PlaySize);
            this.Hud.AddElement(new Button(this.Hud, this.PlaySize, 0, 100, 50, "Restart", 15)); //1
            this.Hud.AddElement(new Button(this.Hud, this.PlaySize, 50, 100, 50, "Main Menu", 15)); //3
            this.Hud.AddElement(new Lable(this.PlaySize, 125, "Time:", 15, false));
            this.Hud.AddElement(new Lable(this.PlaySize, 150, "Time Number here", 15, false)); //5
            this.Hud.AddElement(new Lable(this.PlaySize, 200, "Sand:", 15, false));
            this.Hud.AddElement(new Lable(this.PlaySize, 225, "Sand Number here", 15, false)); //7
            this.Hud.AddElement(new Lable(this.PlaySize, 250, "Lives:", 15, false));
            this.Hud.AddElement(new Lable(this.PlaySize, 275, "Live Number here", 15, false)); //9
        };
        World.prototype.GotoLoseScreen = function () {
            this.GameState = 2;
            this.LoseScreen = new Gui(this.Guictx, this.PlaySize, this.PlaySize);
            this.LoseScreen.AddElement(new Button(this.LoseScreen, this.PlaySize, 0, 100, 50, "Restart", 15)); //1
            this.LoseScreen.AddElement(new Button(this.LoseScreen, this.PlaySize, 50, 100, 50, "Main Menu", 15)); //3
            this.LoseScreen.AddElement(new Lable(50, 100, "You got rekt", 30, false));
            this.LoseScreen.AddElement(new Lable(50, 200, "You lasted a time of:" + this.Time.toString(), 30, false)); //5
        };
        World.prototype.GotoCredits = function () {
            this.GameState = 4;
            this.Credits = new Gui(this.Guictx, this.PlaySize, this.PlaySize);
            this.Credits.AddElement(new Button(this.Credits, this.PlaySize, 0, 100, 50, "Main Menu", 15)); //1
            this.Credits.AddElement(new Lable(50, 100, "Sam: Programmer, designer", 30, false));
            this.Credits.AddElement(new Lable(50, 150, "Sacha: Designer, tester", 30, false));
            this.Credits.AddElement(new Lable(50, 200, "Nik: Skrub", 30, false));
        };

        World.prototype.VallyGen = function (x, y, SeedX, SeedY, SeedZ) {
            var val = Math.sin((x - (y / SeedX)) / SeedZ) * SeedY;
            return val;
        };
        World.prototype.MountainGen = function (x, y, SeedX, SeedY, SeedZ) {
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
        };
        World.prototype.SlopeGen = function (x, y) {
            return (2 - ((x / this.WorldSize) + (y / this.WorldSize))) * this.GroundHeight.MaxHeight / 2;
        };
        World.prototype.WorldGenClassic = function (ix, iy) {
            if (typeof ix === "undefined") { ix = 10; }
            if (typeof iy === "undefined") { iy = 10; }
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
            this.GroundType.SetValueAt(InflowX, InflowY, 2);
            this.GroundType.SetValueAt(XLow, YLow, 3);
            for (var i = 0; i < this.HousesRemaining; ++i) {
                var x = Math.round(Math.random() * (this.WorldSize - 1));
                var y = Math.round(Math.random() * (this.WorldSize - 1));
                var dis = 20;
                if (Math.abs(InflowX - x) > dis && Math.abs(InflowY - y) > dis) {
                    this.GroundType.SetValueAt(x, y, 1);
                } else {
                    i--;
                }
            }
        };

        World.prototype.WorldGenMountains = function (ix, iy) {
            if (typeof ix === "undefined") { ix = 10; }
            if (typeof iy === "undefined") { iy = 10; }
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
                var x = Math.round(Math.random() * (this.WorldSize - 1));
                var y = Math.round(Math.random() * (this.WorldSize - 1));
                var dis = 20;
                if (Math.abs(InflowX - x) > dis && Math.abs(InflowY - y) > dis) {
                    this.GroundType.SetValueAt(x, y, 1);
                } else {
                    i--;
                }
            }
        };
        World.prototype.WorldGenTwoVillages = function () {
            this.HousesRemaining = 0;
            var InflowX = 10;
            var InflowY = 10;
            this.WorldGenClassic(InflowX, InflowY);
            var Corners = [[0, this.WorldSize], [this.WorldSize, 0]];
            for (var i = 0; i < 2; ++i) {
                var x = Math.round(Math.random() * (this.WorldSize - 1));
                var y = Math.round(Math.random() * (this.WorldSize - 1));
                var dis = 10;
                var disV = 50;
                if (Math.abs(InflowX - x) > dis && Math.abs(InflowY - y) > dis && Math.abs(Corners[i][0] - x) < disV && Math.abs(Corners[i][1] - y) < disV) {
                    this.GroundType.SetValueAt(x, y, 1);
                } else {
                    i--;
                }
            }
            this.HousesRemaining = 1;
        };
        World.prototype.UpdateWorldFlow = function () {
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
        };
        World.prototype.UpdateOutFlow = function () {
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
        };
        World.prototype.UpdateWater = function () {
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
            this.WaterHeight = this.WaterHeightBuffer;
            this.WaterHeightBuffer = new Grid(this.WorldSize, this.WorldSize);
            this.WaterHeightBuffer.MaxHeight = this.WaterHeight.MaxHeight;
        };
        World.prototype.UpdateSandSlumping = function () {
            for (var x = 0; x < this.GroundHeight.SizeX; ++x) {
                for (var y = 0; y < this.GroundHeight.SizeY; ++y) {
                    var NetVolume = 0;
                    for (var i = 0; i < this.SearchSpace.length; ++i) {
                        var VolumeOut = 0;
                        var Offset = this.SearchSpace[i];
                        if (!(x - Offset[0] < 0 || y - Offset[1] < 0 || x - Offset[0] >= this.GroundHeight.SizeX || y - Offset[1] >= this.GroundHeight.SizeY)) {
                            var Lim = this.SlumpLimitDry;
                            if (this.WaterHeight.GetValueAt(x - Offset[0], y - Offset[1]) > 0) {
                                Lim = this.SlumpLimitWet;
                            }
                            var HeightDiffSand = (this.GroundHeight.GetValueAt(x, y) - this.GroundHeight.GetValueAt(x - Offset[0], y - Offset[1]));
                            var HeightDiff = HeightDiffSand + (this.RockHeight.GetValueAt(x, y) - this.RockHeight.GetValueAt(x - Offset[0], y - Offset[1]));
                            if (HeightDiff > Lim) {
                                VolumeOut = HeightDiffSand * this.SlumpConst * this.DeltaTime;
                                NetVolume += VolumeOut;
                            }
                        }
                        if (this.GroundHeightBuffer.GetValueAt(x - Offset[0], y - Offset[1]) + VolumeOut < 0) {
                            VolumeOut = this.GroundHeightBuffer.GetValueAt(x - Offset[0], y - Offset[1]);
                        }
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
        };
        World.prototype.Sign = function (x) {
            if (x == 0) {
                return 0;
            }
            return x / Math.abs(x);
        };
        World.prototype.UpdateSiltTransport = function () {
            for (var x = 0; x < this.SiltMap.SizeX; ++x) {
                for (var y = 0; y < this.SiltMap.SizeY; ++y) {
                    if (this.WaterHeight.GetValueAt(x, y) > 0) {
                        var OffsetX = this.Sign(this.VelocityMapX.GetValueAt(x, y) * this.DeltaTime);
                        var OffsetY = this.Sign(this.VelocityMapY.GetValueAt(x, y) * this.DeltaTime);
                        if (x - OffsetX < 0 || y - OffsetY < 0 || x - OffsetX >= this.WaterHeight.SizeX || y - OffsetY >= this.WaterHeight.SizeY) {
                            //exception
                            this.SiltMapBuffer.SetValueAt(x, y, this.SiltMap.GetValueAt(x, y));
                        } else {
                            this.SiltMapBuffer.SetValueAt(x, y, this.SiltMap.GetValueAt(x - OffsetX, y - OffsetY));
                        }
                    }
                }
            }

            //Flip Silt buffer
            this.SiltMap = this.SiltMapBuffer;
            this.SiltMapBuffer = new Grid(this.WorldSize, this.WorldSize);
            this.SiltMapBuffer.MaxHeight = this.SiltMap.MaxHeight;
        };
        World.prototype.GetTilt = function (x, y) {
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
        };
        World.prototype.UpdateSilting = function () {
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
                    } else if (Capacity <= this.SiltMap.GetValueAt(x, y)) {
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
        };
        World.prototype.UpdateVelocity = function () {
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
        };
        World.prototype.Update = function () {
            this.Time += this.DeltaTime;
            for (var i = 0; i < this.UpdatePerTick; ++i) {
                if (this.Time >= this.StartTime) {
                    this.UpdateWorldFlow();
                }
                this.UpdateWater();
                this.UpdateVelocity();
                this.UpdateSilting();
                this.UpdateSiltTransport();
                this.UpdateSandSlumping();
            }
            //this.Inflow += 1;
        };
        World.prototype.RenderBoarder = function (xo) {
            if (typeof xo === "undefined") { xo = 0; }
            var Boarder = 2;
            this.Guictx.beginPath();
            this.Guictx.rect(1, 1, this.GuiCanvas.width - (Boarder + xo), this.GuiCanvas.height - Boarder);
            this.Guictx.lineWidth = 2;
            this.Guictx.strokeStyle = 'black';
            this.Guictx.stroke();
        };
        World.prototype.RenderHTMLCanvas = function () {
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
                    } else {
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
                        B += 255; // * BrightnessDecWater;
                        B /= Math.max(2, Math.ceil(G / 255));
                    }
                    if (R > 255) {
                        R = 255;
                    }
                    if (G > 255) {
                        G = 255;
                    }
                    if (B > 255) {
                        B = 255;
                    }
                    var fillR = Math.round(R).toString(16);
                    if (fillR.length == 1) {
                        fillR = "0" + fillR;
                    }
                    var fillG = Math.round(G).toString(16);
                    if (fillG.length == 1) {
                        fillG = "0" + fillG;
                    }
                    var fillB = Math.round(B).toString(16);
                    if (fillB.length == 1) {
                        fillB = "0" + fillB;
                    }
                    if (this.GroundType.GetValueAt(x, y) == 1) {
                        fillR = "00";
                        fillG = "FF";
                        fillB = "00";
                    }
                    this.RenderctxHTML.fillStyle = "#" + fillR + fillG + fillB;
                    this.RenderctxHTML.fillRect(x * this.GridToCanvas, y * this.GridToCanvas, this.GridToCanvas, this.GridToCanvas);
                }
            }
        };
        World.prototype.RenderWebGL = function () {
            ///
            this.RenderctxGL.clear(this.RenderctxGL.COLOR_BUFFER_BIT | this.RenderctxGL.DEPTH_BUFFER_BIT);
            this.RenderctxGL.bindBuffer(this.RenderctxGL.ARRAY_BUFFER, this.GridVertexBuffer);
            this.RenderctxGL.vertexAttribPointer(this.VertexPos, 2, this.RenderctxGL.FLOAT, false, 0, 0);
            this.RenderctxGL.bindBuffer(this.RenderctxGL.ARRAY_BUFFER, this.GridColourBuffer);
            this.RenderctxGL.vertexAttribPointer(this.ColourPos, 3, this.RenderctxGL.FLOAT, false, 0, 0);
            this.RenderctxGL.drawArrays(this.RenderctxGL.TRIANGLE_STRIP, 0, 3);
        };
        World.prototype.DeltaTimeCalculate = function () {
            var rtime = Date.prototype.getTime();
            this.DeltaTime = rtime - this.RealTime;
            this.DeltaTime *= this.GameTimeScale; //This was due to issues
        };
        World.prototype.Render = function () {
            if (this.CanRenderWebGL) {
                this.RenderWebGL();
            } else {
                this.RenderHTMLCanvas();
            }
            this.RenderBoarder(100);
        };
        World.prototype.PollInput = function () {
            var DeltaHeight = 0;
            var HeightPerSecond = 40;

            //if (Button == 0) { DeltaHeight = HeightPerSecond; }
            //if (Button == 2) { DeltaHeight = HeightPerSecond; }
            if (MouseButton == 1) {
                //document.getElementById("out").innerHTML = this.WaterHeight.GetValueAt(MouseChunkX, MouseChunkY).toString() + ":Water ," + this.GroundHeight.GetValueAt(MouseChunkX, MouseChunkY) + ":Ground," + (this.SiltMap.GetValueAt(MouseChunkX, MouseChunkY) / (this.SedimentCapacityConst * this.WaterHeight.GetValueAt(MouseChunkX, MouseChunkY))) + "%:Silts";
            }
            var Direction = 0;
            if (MouseButton == 0) {
                Direction = -1;
            }
            if (MouseButton == 2) {
                Direction = 1.5;
            }
            if (Direction != 0) {
                this.ManipulateSand(MouseChunkX, MouseChunkY, 10, Direction, 0.3);
            }
            //Button = -1;
        };
        World.prototype.DistributionFunction = function (x, y) {
            return -((x * x) + (y * y));
            //return Math.abs(x) + Math.abs(y);
        };
        World.prototype.CanDig = function (X, Y, xo, yo, SizeOffset, Min, WaterDepth) {
            if (X < 0) {
                return false;
            }
            if (X >= this.WorldSize) {
                return false;
            }
            if (Y < 0) {
                return false;
            }
            if (Y >= this.WorldSize) {
                return false;
            }
            if (this.WaterHeight.GetValueAt(X, Y) > WaterDepth) {
                return false;
            }
            if (this.DistributionFunction(xo - SizeOffset, yo - SizeOffset) + Min < 0) {
                return false;
            }
            if (this.GroundType.GetValueAt(xo - SizeOffset, yo - SizeOffset) == 1) {
                return false;
            }
            return true;
        };
        World.prototype.ManipulateSand = function (ChunkX, ChunkY, Size, Direction, factor) {
            var SizeOffset = Size / 2;
            var Area = 0;
            var Factor = factor;
            var Depth = 0;
            if (Direction > 0) {
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
                Factor = (this.PickedUpSand / Area);
            }
            for (var xo = 0; xo < Size; ++xo) {
                var X = MouseChunkX - (xo - SizeOffset);
                for (var yo = 0; yo < Size; ++yo) {
                    var Y = MouseChunkY - (yo - SizeOffset);
                    if (this.CanDig(X, Y, xo, yo, SizeOffset, Min, Depth)) {
                        //Simulate
                        var Distribution = this.DistributionFunction(xo - SizeOffset, yo - SizeOffset) + Min;
                        Distribution = (Direction * Distribution * Factor); // / (Area);

                        //Distribution *= Direrction;
                        if (this.GroundHeight.GetValueAt(X, Y) + Distribution > this.GroundHeight.MaxHeight) {
                            Distribution = this.GroundHeight.MaxHeight - this.GroundHeight.GetValueAt(X, Y);
                        }
                        if (this.GroundHeight.GetValueAt(X, Y) + Distribution < 0) {
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
        };
        World.prototype.MainLoop = function () {
            switch (this.GameState) {
                case 0:
                    this.Guictx.clearRect(0, 0, this.GuiCanvas.width, this.GuiCanvas.height);
                    this.MainMenu.Update(MouseX, MouseY, MouseButton);
                    this.MainMenu.Render();
                    if (this.MainMenu.Elements[1].State == 2) {
                        this.GotoGameSelection();
                    }
                    if (this.MainMenu.Elements[3].State == 2) {
                        this.GotoCredits();
                    }

                    break;
                case 1:
                    this.Guictx.clearRect(0, 0, this.GuiCanvas.width, this.GuiCanvas.height);
                    this.Hud.Elements[5].Text = this.Time.toString();
                    this.Hud.Elements[7].Text = this.PickedUpSand.toString();
                    this.Hud.Elements[9].Text = this.HousesRemaining.toString();
                    this.PollInput();
                    this.Render();
                    this.Update();
                    this.Hud.Update(MouseX, MouseY, MouseButton);
                    this.Hud.Render();
                    if (this.Hud.Elements[1].State == 2) {
                        this.InitGame();
                    }
                    if (this.Hud.Elements[3].State == 2) {
                        this.GotoMainMenu();
                    }

                    break;
                case 2:
                    this.Guictx.clearRect(0, 0, this.GuiCanvas.width, this.GuiCanvas.height);
                    this.LoseScreen.Elements[5].Text = "You lasted a time of:" + this.Time.toString();
                    this.LoseScreen.Update(MouseX, MouseY, MouseButton);
                    this.LoseScreen.Render();
                    if (this.LoseScreen.Elements[1].State == 2) {
                        this.InitGame();
                    }
                    if (this.LoseScreen.Elements[3].State == 2) {
                        this.GotoMainMenu();
                    }

                    break;
                case 3:
                    this.Guictx.clearRect(0, 0, this.GuiCanvas.width, this.GuiCanvas.height);
                    this.GameSelection.Update(MouseX, MouseY, MouseButton);
                    this.GameSelection.Render();
                    if (this.GameSelection.Elements[3].State == 2) {
                        this.InitGame();
                    }
                    if (this.GameSelection.Elements[5].OptionSelected == 0) {
                        this.SetGameSelectionCustom(false);
                    } else {
                        this.SetGameSelectionCustom(true);
                    }
                    this.GameSelectionCustom.Update(MouseX, MouseY, MouseButton);
                    this.GameSelectionCustom.Render();

                    break;
                case 4:
                    this.Guictx.clearRect(0, 0, this.GuiCanvas.width, this.GuiCanvas.height);
                    this.Credits.Update(MouseX, MouseY, MouseButton);
                    this.Credits.Render();
                    if (this.Credits.Elements[1].State == 2) {
                        this.GotoMainMenu();
                    }

                    break;
                case 5:
                    break;
            }
            this.RenderBoarder();
            //return;
        };
        return World;
    })();
    ;
    var MouseX = 0;
    var MouseY = 0;
    var MouseChunkX = 0;
    var MouseChunkY = 0;
    var MouseButton = -1;
    var MaxShaders = 2;
    function LoadingShaders() {
        --MaxShaders;
        if (MaxShaders == 0) {
            Start();
        }
    }

    
    $("#FragmentShader").load("FragmentShader.fs", function () {
        console.log("FragmentShader loaded");
        LoadingShaders();
    });
    $("#VertexShader").load("VertexShader.vs", function () {
        console.log("VertexShader loaded");
        LoadingShaders();
    });
    var UpdateSpeed = 10;

    //world.MainLoop();
    function Start() {
        console.log("world defined");
        var world = new World();
        var Interval = 0;
        world.GuiCanvas.onmousemove = function (event) {
            MouseX = event.pageX - world.GuiCanvas.offsetLeft;
            MouseY = event.pageY - world.GuiCanvas.offsetTop;
            MouseChunkX = Math.floor((event.pageX - world.GuiCanvas.offsetLeft) / world.GridToCanvas);
            MouseChunkY = Math.floor((event.pageY - world.GuiCanvas.offsetTop) / world.GridToCanvas);
        };
        world.GuiCanvas.onmousedown = function (event) {
            MouseButton = event.button;
            return true;
        };
        world.GuiCanvas.onmouseup = function (event) {
            MouseButton = -1;
            return true;
        };
        Interval = setInterval(function () {
            world.MainLoop();
        }, UpdateSpeed);
    }
})(Pipe || (Pipe = {}));
//# sourceMappingURL=Pipe.js.map
