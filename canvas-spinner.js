/**
 * Created by soonlive on 11/18/15.
 */

function CanvasSpinner(canvasElem) {
  this.ctx = canvasElem.getContext('2d');

  this.color = '#0F93D2';

  this.rotateAngle = 0;
  this.rotateSpeed = 2.2;

  this.expandSpeed = 0.06;
  this.collapseSpeed = 0.06;

  this.anglePerExpand = 1.7;
  this.startAngle = parseInt(Math.random() * 20) / 10; // random 0 ~ 2
  this.endAngle = (this.startAngle + this.anglePerExpand) % 2;

  this.stop = false;
  this.requests = [];
}


CanvasSpinner.prototype.drawCircle = function (startAngle, endAngle, counterclockwise) {
  this.ctx.clearRect(0, 0, 300, 300);
  this.ctx.save();
  this.rotate(this.rotateAngle + this.rotateSpeed);

  this.ctx.beginPath();
  this.ctx.arc(150, 150, 50, startAngle * Math.PI, endAngle * Math.PI, counterclockwise);
  this.ctx.lineWidth = 15;
  this.ctx.lineCap = 'round';
  this.ctx.strokeStyle = this.color;
  this.ctx.stroke();
  this.ctx.restore();

};


/**
 * rotate the circle before drawing
 * @param rotateAngle
 */
CanvasSpinner.prototype.rotate = function (rotateAngle) {
  this.rotateAngle = rotateAngle; //refresh the rotate angle
  this.ctx.translate(150, 150); // translate to center
  this.ctx.rotate((Math.PI / 180) * this.rotateAngle); // rotate
  this.ctx.translate(-150, -150); // translate back
};


CanvasSpinner.prototype.isAnimateCircleEnd = function (currentAngle, endAngle) {
  return Math.abs(currentAngle - endAngle) < 0.1; // animation end, once the angle between currentAngle and endAngle less than 0.1
};

/**
 * just rotate circle without animation for a while,
 * the bigger endAngle the longer time, the less angleSpeed the shorter time
 * @param startAngle
 * @param currentAngle
 * @param endAngle
 * @param angleSpeed
 * @param counterclockwise
 * @param done
 */
CanvasSpinner.prototype.rotateCircle = function (startAngle, currentAngle, endAngle, angleSpeed, counterclockwise, done) {
  this.drawCircle(startAngle, currentAngle, counterclockwise);

  if (this.isAnimateCircleEnd(currentAngle, endAngle)) {
    done.call(this, startAngle, currentAngle);
  } else {
    startAngle = (startAngle + angleSpeed) % 2;
    currentAngle = (currentAngle + angleSpeed) % 2;

    this.requests.push(window.requestAnimationFrame(this.rotateCircle.bind(this, startAngle, currentAngle, endAngle, angleSpeed, counterclockwise, done)));
  }

};

/**
 * draw clockwise or anticlockwise circle animately
 * @param startAngle
 * @param currentAngle
 * @param endAngle
 * @param angleSpeed
 * @param counterclockwise
 * @param done
 */
CanvasSpinner.prototype.animateCircle = function (startAngle, currentAngle, endAngle, angleSpeed, counterclockwise, done) {
  this.drawCircle(startAngle, currentAngle, counterclockwise);

  if (this.isAnimateCircleEnd(currentAngle, endAngle)) {
    done.call(this, startAngle, currentAngle);
  } else {
    currentAngle = (currentAngle + angleSpeed) % 2;

    this.requests.push(window.requestAnimationFrame(this.animateCircle.bind(this, startAngle, currentAngle, endAngle, angleSpeed, counterclockwise, done)));
  }
};

/**
 * expand circle from startAngle to endAngle
 * @param startAngle
 * @param currentAngle
 * @param endAngle
 * @param done
 */
CanvasSpinner.prototype.collapseCircle = function collapseCircle(startAngle, currentAngle, endAngle, done) {
  this.ctx.globalCompositeOperation = 'destination-atop';
  this.requests.push(window.requestAnimationFrame(this.animateCircle.bind(this, startAngle, currentAngle, endAngle, this.collapseSpeed, true, done)));
};

CanvasSpinner.prototype.expandCircle = function (startAngle, currentAngle, endAngle, done) {

  this.requests.push(window.requestAnimationFrame(this.animateCircle.bind(this, startAngle, currentAngle, endAngle, this.expandSpeed, false, done)));
};


/**
 * draw spinner
 * @param startAngle
 * @param currentAngle
 * @param endAngle
 */
CanvasSpinner.prototype.draw = function (startAngle, currentAngle, endAngle) {
  this.expandCircle(startAngle, currentAngle, endAngle, function (startAngle, endAngle) {
    this.rotateCircle(startAngle, endAngle, (endAngle + 0.2) % 2, 0.008, false, function (startAngle, endAngle) {
      this.collapseCircle(endAngle, startAngle, endAngle, function (startAngle, endAngle) {
        this.rotateCircle(startAngle - 0.01, startAngle, (startAngle + 0.2) % 2, 0.004, false, function (startAngle, endAngle) {
          if (!this.isStopped) {
            this.requests.push(window.requestAnimationFrame(this.draw.bind(this, startAngle, endAngle, (startAngle + this.anglePerExpand) % 2)))
          } else {
            for (var i = 0; i < this.requests.length; ++i) {
              window.cancelAnimationFrame(this.requests[i]);
            }
          }
        })
      });
    })
  });
};


CanvasSpinner.prototype.load = function () {
  this.requests.push(window.requestAnimationFrame(this.draw.bind(this, this.startAngle, this.startAngle, this.endAngle)));
};

CanvasSpinner.prototype.stop = function () {
  this.isStopped = true;
};

