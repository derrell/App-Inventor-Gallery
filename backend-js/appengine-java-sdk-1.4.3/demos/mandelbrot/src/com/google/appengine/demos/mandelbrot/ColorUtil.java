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
 * Creates integer values corresponding to the specified color.
 *
 */
public class ColorUtil {
  /**
   * Extracts the red component from {@code color}.
   */
  public static int red(int color) {
    return color & 0xff;
  }

  /**
   * Extracts the green component from {@code color}.
   */
  public static int green(int color) {
    return (color >> 8) & 0xff;
  }

  /**
   * Extracts the blue component from {@code color}.
   */
  public static int blue(int color) {
    return (color >> 16) & 0xff;
  }

  /**
   * Creates a color that corresponds to the specified values.
   *
   * @param red is an integer between 0 and 255
   * @param green is an integer between 0 and 255
   * @param blue is an integer between 0 and 255
   */
  public static int create(int red, int green, int blue) {
    int value = (red & 0xff);
    value |= (green & 0xff) << 8;
    value |= (blue & 0xff) << 16;
    return value;
  }
}
