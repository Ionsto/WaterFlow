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
    console.log("Grid defined");
    var World = (function () {
        function World() {
            this.PickedUpSand = 0;
            this.WorldSize = 100;
            this.GridToCanvas = 5;
            ///
            this.DeltaTime = 1;
            this.Gravity = 10;
            this.PipeLength = 1;
            this.PipeCrossSection = 5;
            this.UpdatePerTick = 2;
            this.SedimentDepositingConst = 10;
            this.SedimentDissolvingConst = 10;
            this.Inflow = 10;
            this.OutFlow = 10;
            ////
            this.GroundType = new Grid(this.WorldSize, this.WorldSize);
            this.WaterHeight = new Grid(this.WorldSize, this.WorldSize);
            this.WaterHeightBuffer = new Grid(this.WorldSize, this.WorldSize);
            this.GroundHeight = new Grid(this.WorldSize, this.WorldSize, 1);
            this.GroundHeightBuffer = new Grid(this.WorldSize, this.WorldSize, 1);
            //public InFlowMap: Array<Grid>;
            this.OutFlowMap = [];
            this.VelocityMapX = new Grid(this.WorldSize, this.WorldSize);
            this.VelocityMapY = new Grid(this.WorldSize, this.WorldSize);
            this.SiltMap = new Grid(this.WorldSize, this.WorldSize);
            this.SiltMapBuffer = new Grid(this.WorldSize, this.WorldSize);
            this.SearchSpace = [[1, 0], [0, 1], [-1, 0], [0, -1]];
            this.Canvas = document.getElementById("RenderCanvas");
            this.ctx = this.Canvas.getContext("2d");
            this.WaterHeight.MaxHeight = 100;
            this.WaterHeightBuffer.MaxHeight = this.WaterHeight.MaxHeight;
            this.SiltMap.MaxHeight = -1;
            this.SiltMapBuffer.MaxHeight = this.SiltMap.MaxHeight;
            for (var i = 0; i < 4; ++i) {
                //this.InFlowMap[i] = new Grid(this.WorldSize, this.WorldSize);
                this.OutFlowMap[i] = new Grid(this.WorldSize, this.WorldSize);
            }
            this.WorldGen();
            //this.WaterHeight.SetValueAt(0, 0, 1000);
            //this.GroundHeight.GetMean();
        }
        World.prototype.WorldGen = function () {
            for (var x = 0; x < this.GroundHeight.SizeX; ++x) {
                for (var y = 0; y < this.GroundHeight.SizeY; ++y) {
                    var Slope = (2 - ((x / this.WorldSize) + (y / this.WorldSize))) * this.GroundHeight.MaxHeight / 2;
                    this.GroundHeight.SetValueAt(x, y, Slope + (Math.random() * 5));
                }
            }
            this.GroundType.SetValueAt(0, 0, 2);
            this.GroundType.SetValueAt(this.WorldSize, this.WorldSize, 3);
        };
        World.prototype.UpdateWorldFlow = function () {
            for (var x = 0; x < this.GroundType.SizeX; ++x) {
                for (var y = 0; y < this.GroundType.SizeY; ++y) {
                    if (this.GroundType.GetValueAt(x, y) == 2) {
                        this.WaterHeight.AddValueAt(x, y, this.Inflow * this.DeltaTime);
                    }
                    if (this.GroundType.GetValueAt(x, y) == 3) {
                        this.WaterHeight.AddValueAt(x, y, -this.OutFlow * this.DeltaTime);
                    }
                    if (this.WaterHeight.GetValueAt(x, y) < 0) {
                        this.WaterHeight.SetValueAt(x, y, 0);
                    }
                }
            }
        };
        World.prototype.UpdateOutFlow = function () {
            for (var x = 0; x < this.WaterHeight.SizeX; ++x) {
                for (var y = 0; y < this.WaterHeight.SizeY; ++y) {
                    //Each cell is connected to two others, (down & right)
                    var TotalFlow = 0;
                    for (var i = 0; i < this.SearchSpace.length; ++i) {
                        var Offset = this.SearchSpace[i];
                        var HeightDifference = (this.GroundHeight.GetValueAt(x, y) + this.WaterHeight.GetValueAt(x, y)) - (this.GroundHeight.GetValueAt(x + Offset[0], y + Offset[1]) + this.WaterHeight.GetValueAt(x + Offset[0], y + Offset[1]));
                        var Flow = Math.max(0, this.OutFlowMap[i].GetValueAt(x, y) + (this.DeltaTime * this.PipeCrossSection * ((this.Gravity * HeightDifference) / this.PipeLength)));
                        TotalFlow += Flow;
                        this.OutFlowMap[i].SetValueAt(x, y, Flow);
                    }
                    if (TotalFlow > this.WaterHeight.GetValueAt(x, y)) {
                        var KScale = Math.min(1, this.WaterHeight.GetValueAt(x, y) / (TotalFlow * this.DeltaTime));
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
                        if (!(x - Offset[0] < 0 || y - Offset[1] < 0 || x - Offset[0] > this.WaterHeight.SizeX || y - Offset[1] > this.WaterHeight.SizeY)) {
                            VolumeIn += this.OutFlowMap[i].GetValueAt(x - Offset[0], y - Offset[1]);
                        }
                        VolumeOut += this.OutFlowMap[i].GetValueAt(x, y);
                    }
                    var VolumeNet = this.DeltaTime * (VolumeIn - VolumeOut);
                    this.WaterHeightBuffer.SetValueAt(x, y, this.WaterHeight.GetValueAt(x, y) + VolumeNet);
                    if (this.WaterHeightBuffer.GetValueAt(x, y) < 0.01) {
                        this.WaterHeightBuffer.SetValueAt(x, y, 0);
                    }
                }
            }
            this.WaterHeight = this.WaterHeightBuffer;
            this.WaterHeightBuffer = new Grid(this.WorldSize, this.WorldSize);
            this.WaterHeightBuffer.MaxHeight = this.WaterHeight.MaxHeight;
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
            var count = 1;
            for (var i = 0; i < this.SearchSpace.length; i += 2) {
                var Offset = this.SearchSpace[i];
                if (!(x - Offset[0] < 0 || y - Offset[1] < 0 || x - Offset[0] > this.GroundHeight.SizeX || y - Offset[1] > this.GroundHeight.SizeY)) {
                    DX += this.GroundHeight.GetValueAt(x - Offset[0], y - Offset[1]);
                    ++count;
                }
            }
            DX /= count;
            count = 1;
            for (var i = 1; i < this.SearchSpace.length; i += 2) {
                var Offset = this.SearchSpace[i];
                if (!(x - Offset[0] < 0 || y - Offset[1] < 0 || x - Offset[0] > this.GroundHeight.SizeX || y - Offset[1] > this.GroundHeight.SizeY)) {
                    DY += this.GroundHeight.GetValueAt(x - Offset[0], y - Offset[1]);
                    ++count;
                }
            }
            DY /= count;
            var theta = Math.tan(DX / 3) + Math.tan(DY / 3);

            //avradge tilt
            return theta / 2;
        };
        World.prototype.UpdateSilting = function () {
            for (var x = 0; x < this.GroundHeight.SizeX; ++x) {
                for (var y = 0; y < this.GroundHeight.SizeY; ++y) {
                    var VX = this.VelocityMapX.GetValueAt(x, y);
                    var VY = this.VelocityMapY.GetValueAt(x, y);
                    var Speed = Math.sqrt((VX * VX) + (VY * VY));
                    var Capacity = this.SedimentCapacity * Speed * Math.sin(this.GetTilt(x, y));
                }
            }
            this.GroundHeight = this.GroundHeightBuffer;
            this.GroundHeightBuffer = new Grid(this.WorldSize, this.WorldSize);
            this.GroundHeightBuffer.MaxHeight = this.GroundHeight.MaxHeight;
        };
        World.prototype.UpdateVelocity = function () {
            for (var x = 0; x < this.GroundHeight.SizeX; ++x) {
                for (var y = 0; y < this.GroundHeight.SizeY; ++y) {
                    var VX = 0;
                    var VY = 0;
                    for (var i = 0; i < this.SearchSpace.length; i += 2) {
                        var Offset = this.SearchSpace[i];
                        if (!(x - Offset[0] < 0 || y - Offset[1] < 0 || x - Offset[0] > this.WaterHeight.SizeX || y - Offset[1] > this.WaterHeight.SizeY)) {
                            VX += this.OutFlowMap[i].GetValueAt(x - Offset[0], y - Offset[1]);
                        }
                        VX -= this.OutFlowMap[i].GetValueAt(x, y);
                    }
                    for (var i = 1; i < this.SearchSpace.length; i += 2) {
                        var Offset = this.SearchSpace[i];
                        if (!(x - Offset[0] < 0 || y - Offset[1] < 0 || x - Offset[0] > this.WaterHeight.SizeX || y - Offset[1] > this.WaterHeight.SizeY)) {
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
            for (var i = 0; i < this.UpdatePerTick; ++i) {
                this.UpdateWorldFlow();
                this.UpdateWater();
                //this.UpdateVelocity();
                //this.UpdateSilting();
                //this.UpdateSiltTransport();
            }
        };
        World.prototype.Render = function () {
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
                        B += 255; // * BrightnessDecWater;
                        B /= Math.max(2, Math.ceil(G / 255));
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
                    this.ctx.fillStyle = "#" + fillR + fillG + fillB;
                    this.ctx.fillRect(x * this.GridToCanvas, y * this.GridToCanvas, this.GridToCanvas, this.GridToCanvas);
                }
            }
            return;
        };
        World.prototype.PollInput = function () {
            var DeltaHeight = 0;
            var HeightPerSecond = 10;

            //if (Button == 0) { DeltaHeight = HeightPerSecond; }
            //if (Button == 2) { DeltaHeight = HeightPerSecond; }
            if (Button == 1) {
                document.getElementById("out").innerHTML = this.WaterHeight.GetValueAt(MouseChunkX, MouseChunkY).toString() + ":Water ," + this.GroundHeight.GetValueAt(MouseChunkX, MouseChunkY) + ":Ground,";
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
                this.ManipulateSand(MouseChunkX, MouseChunkY, 10, Direction, 3000);
            }
            //Button = -1;
        };
        World.prototype.DistributionFunction = function (x, y) {
            return Math.abs(x) + Math.abs(y);
        };
        World.prototype.ManipulateSand = function (ChunkX, ChunkY, Size, Direction, factor) {
            var SizeOffset = Size / 2;
            var Area = 0;
            var Factor = factor;
            var Min = this.DistributionFunction(-SizeOffset, -SizeOffset);
            for (var xo = 0; xo < Size; ++xo) {
                var X = MouseChunkX - (xo - SizeOffset);
                if (X < 0) {
                    continue;
                }
                if (X > this.WorldSize) {
                    continue;
                }
                for (var yo = 0; yo < Size; ++yo) {
                    var Y = MouseChunkY - (yo - SizeOffset);
                    if (Y < 0) {
                        continue;
                    }
                    if (Y > this.WorldSize) {
                        continue;
                    }
                    Area += this.DistributionFunction(X, Y) + Min;
                }
            }
            if (Factor * Area * Direction > this.PickedUpSand) {
                Factor *= (this.PickedUpSand / Area);
            }
            for (var xo = 0; xo < Size; ++xo) {
                var X = MouseChunkX - (xo - SizeOffset);
                if (X < 0) {
                    continue;
                }
                if (X > this.WorldSize) {
                    continue;
                }
                for (var yo = 0; yo < Size; ++yo) {
                    var Y = MouseChunkY - (yo - SizeOffset);
                    if (Y < 0) {
                        continue;
                    }
                    if (Y > this.WorldSize) {
                        continue;
                    }

                    //Simulate
                    var Distribution = this.DistributionFunction(xo - SizeOffset, yo - SizeOffset) + Min;
                    Distribution = (Direction * Distribution * Factor) / (Area);

                    //Distribution *= Direrction;
                    if (this.GroundHeight.GetValueAt(X, Y) + Distribution > this.GroundHeight.MaxHeight) {
                        Distribution = this.GroundHeight.MaxHeight - this.GroundHeight.GetValueAt(X, Y);
                    }
                    if (this.GroundHeight.GetValueAt(X, Y) + Distribution < 0) {
                        Distribution = -this.GroundHeight.GetValueAt(X, Y);
                    }
                    this.GroundHeight.AddValueAt(X, Y, Distribution);
                    this.PickedUpSand -= Distribution;
                }
            }
        };
        World.prototype.MainLoop = function () {
            //if (this.ToUpdate) { this.Update(); this.ToUpdate = false; } else { this.ToUpdate = true; }
            this.PollInput();
            this.Render();
            this.Update();
            //return;
        };
        return World;
    })();
    ;
    var MouseChunkX = 0;
    var MouseChunkY = 0;
    var Button = -1;
    console.log("world defined");
    var world = new World();
    var Interval = 0;
    world.Canvas.onmousemove = function (event) {
        MouseChunkX = Math.floor((event.pageX - world.Canvas.offsetLeft) / world.GridToCanvas);
        MouseChunkY = Math.floor((event.pageY - world.Canvas.offsetTop) / world.GridToCanvas);
    };
    world.Canvas.onmousedown = function (event) {
        Button = event.button;
        return true;
    };
    world.Canvas.onmouseup = function (event) {
        Button = -1;
        return true;
    };
    var UpdateSpeed = 10;
    document.getElementById("ResetButton").onclick = function (event) {
        //alert("dsada");
        clearInterval(Interval);
        world = new World();
        Interval = setInterval(function () {
            world.MainLoop();
        }, UpdateSpeed);
        return true;
    };

    //world.MainLoop();
    Interval = setInterval(function () {
        world.MainLoop();
    }, UpdateSpeed);
})(Pipe || (Pipe = {}));
//# sourceMappingURL=Pipe.js.map
