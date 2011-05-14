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
 * A {@code FractalSource} represents a fractal image of arbitrary
 * size and resolution.
 *
 */
public interface FractalSource {
  /**
   * The left-most boundary of the fractal image.
   */
  final double XMIN = -1.0;

  /**
   * The right-most boundary of the fractal image.
   */
  final double XMAX = 1.0;

  /**
   * The bottom-most boundary of the fractal image.
   */
  final double YMIN = -1.0;

  /**
   * The top-most boundary of the fractal image.
   */
  final double YMAX = 1.0;

  /**
   * The horizontal size of the fractal image.
   */
  final double XRANGE = XMAX - XMIN;

  /**
   * The vertical size of the fractal image.
   */
  final double YRANGE = YMAX - YMIN;

  /**
   * Chooses a color for the specified point.
   *
   * @param x is a value between {@code XMIN} and {@code XMAX}
   * @param y is a value between {@code YMIN} and {@code YMAX}
   *
   * @return an integer reresenting a color as produced by {@link ColorUtil}.
   */
  int getValue(double x, double y);
}
