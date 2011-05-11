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
 * {@code PixelSource} represents a physical image of a specific resolution.
 *
 */
public interface PixelSource {
  /**
   * Returns the width of the image, in pixels.
   */
  int getWidth();

  /**
   * Returns the height of the image, in pixels.
   */
  int getHeight();

  /**
   * Returns a color for the specified pixel, as produced by {@link ColorUtil}.
   */
  int getPixel(int x, int y);
}
