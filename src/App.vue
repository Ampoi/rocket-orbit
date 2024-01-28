<template>
</template>
<script setup lang="ts">
import p5 from "p5"

const { sqrt, sin, cos, atan } = Math

//定数
const gravitationalConstant = 6.67 * (10 ** -11) //m**3 / ( kg * (s ** -2) )
const earthRadius = 6.37 * (10**6) //m
const earthMass = 5.96 * (10**24) //kg
const deltaTime = 1 //s

const getGravitationalAcceleration = (height: number) => gravitationalConstant * earthMass / ( ( height + earthRadius ) ** 2 )

//変数
const getPosition = (
  height: number,
  angleFromEarth: number
) => {
  return {
    x: (earthRadius + height) * sin(angleFromEarth),
    y: (earthRadius + height) * cos(angleFromEarth)
  }
}

let velocity = 10000
let angle = 1/3 * Math.PI
let height = 0
let angleFromEarth = 0
let position = getPosition(height, angleFromEarth)

const episode = () => {
  const horizontalVelocity            = velocity * sin(angle)
  const horizontalDisplacementAmount  = horizontalVelocity * deltaTime

  const verticalVelocity            = velocity * cos(angle) - getGravitationalAcceleration(height) * deltaTime
  const verticalDisplacementAmount  = verticalVelocity * deltaTime

  velocity        = sqrt(horizontalVelocity ** 2 + verticalVelocity ** 2)
  
  const newAngle = atan(horizontalVelocity / verticalVelocity)
  angle = newAngle < 0 ? newAngle + Math.PI : newAngle

  angleFromEarth  += atan(horizontalDisplacementAmount / (earthRadius + height + verticalDisplacementAmount))
  height          = sqrt(horizontalDisplacementAmount ** 2 + (earthRadius + height + verticalDisplacementAmount) ** 2) - earthRadius

  if( height < 0 ){
    stop = true
  }

  position = getPosition(height, angleFromEarth)

  history.push(position)
}

const minimizeRate = 10 ** 4

const history: Record<"x" | "y", number>[] = []
let stop = false

new p5((p: p5) => {
  p.setup = () => {
    p.createCanvas(1000, 1000)
    p.rectMode(p.CENTER)
  }

  p.draw = () => {
    p.translate(-position.x/minimizeRate + 500, position.y/minimizeRate + 500)
    p.background(0)
    
    p.noFill()
    p.stroke(255)
    p.strokeWeight(2)
    p.circle(0, 0, earthRadius/minimizeRate*2)

    history.forEach((history) => {
      p.noStroke()
      p.fill(255, 0, 0)
      p.circle(history.x/minimizeRate, -history.y/minimizeRate, 2)
    })
    
    if( !stop ) episode()
  }
})
</script>