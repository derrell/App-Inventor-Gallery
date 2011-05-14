// Copyright 2009 Google Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//
package com.google.appengine.demos.mandelbrot;

/**
 * {@code TileFactory} wraps a {@link FractalSource} of arbitrary size
 * and complexity and vends {@link PixelSource} objects that
 * correspond to tiles of the overall image.
 *
 */
public class TileFactory {
  /**
   * The size of each tile, expressed as a power of 2.  For example, a
   * value of 6 corresponds to 2**6 x 2**6 tiles (or 64x64).  This
   * should match the value of {@code Image.TileSize} in {@code
   * gigabrot.dzi}.
   */
  private static final int TILEPOW = 8;

  /**
   * The number of pixels of overlap on each side of each tile.  This
   * should match the value of {@code Image.Overlap} in the {@code
   * gigabrot.dzi}.
   */
  private static final int OVERLAP = 1;

  /**
   * The {@link FractalSource} representing the overall image that is being tiled.
   */
  private final FractalSource fractalSource;

  /**
   * Construct a {@link TileFactory} that vends tiles of {@link FractalSource}.
   */
  public TileFactory(FractalSource fractalSource) {
    this.fractalSource = fractalSource;
  }

  /**
   * Constructs a {@link PixelSource} that provides the tile of {@code
   * fractalSource} at coordinates ({@code x} and {@code y}) of level
   * {@code level}.
   *
   * @param level The zoom level of the desired tile.
   * @param x The x coordinate of the desired tile, starting at 0
   * (measured in numbers of tiles).
   * @param y The x coordinate of the desired tile, starting at 0
   * (measured in numbers of tiles).
   */
  public PixelSource createTile(int level, int x, int y) {
    int tile_level = level - TILEPOW;

    double xunits = FractalSource.XRANGE / ((double) (1 << tile_level));
    double yunits = FractalSource.YRANGE / ((double) (1 << tile_level));

    final double xscale = xunits / ((double) (1 << TILEPOW));
    final double yscale = yunits / ((double) (1 << TILEPOW));
    final double xmin = FractalSource.XMIN + xunits * x;
    final double ymin = FractalSource.YMIN + yunits * y;

    int sizelen = 1 << ((level > TILEPOW) ? TILEPOW : level);
    final int width = sizelen + 2 * OVERLAP;
    final int height = sizelen + 2 * OVERLAP;

    return new PixelSource() {
        public int getWidth() {
          return width;
        }

        public int getHeight() {
          return height;
        }

        public int getPixel(int x, int y) {
          return fractalSource.getValue(((double) x) * xscale + xmin,
                                        ((double) y) * yscale + ymin);
        }
    };
  }
}
