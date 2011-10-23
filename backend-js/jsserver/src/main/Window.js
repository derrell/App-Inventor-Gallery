/*
 * http://www.nczonline.net/blog/2008/04/20/get-the-javascript-global/
 * Nice trick to provide a global object.
 */
function get()
{
  return (function()
          {
            if (! this.navigator)
            {
              this.navigator = 
              {
                userAgent:
                  "Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10_6_4; de-de) " +
                  "AppleWebKit/533.17.8 (KHTML, like Gecko) " +
                  "Version/5.0.1 Safari/533.17.8", 
                product: "*DJSS*", // Derrell's JavaScript Server
                cpuClass: ""
              };
            }

            if (! this.window) this.window = this;
            if (! this.qx) this.qx = {};
            if (! this.qxvariants) this.qxvariants = {};
            if (! this.aiagallery) this.aiagallery = {};
            if (! this.rpcjs) this.rpcjs = {};
            if (! this.JSON) this.JSON = JSON;
            
            return this;
          }).call(null);
}

