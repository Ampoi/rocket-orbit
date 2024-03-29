<template>
  <main class="bg-black text-white flex flex-row w-screen h-screen">
    <div ref="orbitCanvas"/>
    <div class="p-4 flex flex-col gap-4 grow">
      <div class="flex flex-col gap-4 border-sky-500/60 text-sky-500 border-[1px] px-4 py-3 grow bg-sky-500/20 rounded-xl">
        <div class="flex flex-col gap-4 grow font-chakra">
          <div class="flex flex-row gap-4 items-center">
            <p class="tracking-wider basis-20">VELOCITY</p>
            <input
              type="number"
              class="outline-none text-sky-500 border-b-[1px] px-1.5 py-1 border-sky-500 bg-sky-500/10"
              v-model="setting.velocity">
          </div>
          <div class="flex flex-row gap-4 items-center">
            <p class="tracking-wider basis-20">ANGLE</p>
            <input
              type="number"
              class="outline-none text-sky-500 border-b-[1px] px-1.5 py-1 border-sky-500 bg-sky-500/10"
              v-model="setting.angle">
          </div>
          <div class="flex flex-row gap-4 items-center">
            <p class="tracking-wider basis-20">HEIGHT</p>
            <input
              type="number"
              class="outline-none text-sky-500 border-b-[1px] px-1.5 py-1 border-sky-500 bg-sky-500/10"
              v-model="setting.height">
          </div>
          <div class="flex flex-row gap-4">
            <p class="basis-20">ANGLE</p>
            <p>{{ Math.round(projectileInformation.angle / Math.PI * 180 * 100) / 100 }}</p>
          </div>
          <div class="flex flex-row gap-4">
            <p class="basis-20">HEIGHT</p>
            <p>{{ Math.round(projectileInformation.height) }}</p>
          </div>
          <div class="flex flex-row gap-4">
            <p class="basis-20">ANGLE_FROM_EARTH</p>
            <p>{{ Math.round(projectileInformation.angleFromEarth / Math.PI * 180 * 100) / 100 }}</p>
          </div>
          <div class="flex flex-row gap-4">
            <p class="basis-20">VELOCITY</p>
            <p>{{ Math.round(projectileInformation.velocity * 100) / 100 }}</p>
          </div>
        </div>
        <button
          class="flex flex-row gap-4"
          @click="ignitionEngine"
          v-for="engine in engines">
          <p class="basis">MAIN_ENGINE</p>
          <div class="bg-sky-500/20 grow h-full">
            <div
              class="h-full bg-sky-500"
              :style="{ width: `${Math.round(engine.fuel / engine.capacity * 100)}%` }"/>
          </div>
        </button>
        <button
          class="px-3 py-2 rounded-lg bg-sky-500 text-white text-center font-chakra text-lg tracking-wide"
          @click="launch">
          LAUNCH
        </button>
      </div>
      <div class="border-sky-500/60 text-sky-500 border-[1px] px-4 py-3 bg-sky-500/20 rounded-xl flex flex-row gap-4">
        <p>©︎Ampoi 2024</p>
        <a href="https://www.fbs.osaka-u.ac.jp/labs/ishijima/Ballistic-01.html">
          参考にしたサイト
        </a>
      </div>
    </div>
  </main>
</template>
<script setup lang="ts">
import p5 from "p5"
import { onMounted, reactive, ref, watch } from "vue";
import { Engine, earthRadius } from "./utils/engine"

const minimizeRate = 10 ** 4 * 5

const setting = reactive({
  velocity: 10000,
  angle: 60,
  height: 0
})

const getSettingForEngine = () => {
  return {
    ...setting,
    angle: setting.angle / 180 * Math.PI
  }
}

let engine = new Engine(getSettingForEngine())
let engineInterval: number

const projectileInformation = reactive({
  angle: engine.angle,
  height: engine.height,
  angleFromEarth: engine.angleFromEarth,
  velocity: engine.velocity
})

watch(setting, () => {
  engine = new Engine(getSettingForEngine())
})

const engines = reactive<{
  [key: string]: {
    force: number
    inOperation: boolean
    fuel: number
    capacity: number
  }
}>({
  mainEngine: {
    force: 10,
    inOperation: false,
    fuel: 1000,
    capacity: 1000
  }
})

const ignitionEngine = () => {
  engines['mainEngine'].inOperation = true
}

const launch = () => {
  engine = new Engine(getSettingForEngine())

  const tps = 100 / engine.deltaTime
  engineInterval = setInterval(() => {
      const stop = engine.episode()
      
      projectileInformation.angle          = engine.angle
      projectileInformation.height         = engine.height
      projectileInformation.angleFromEarth = engine.angleFromEarth
      projectileInformation.velocity       = engine.velocity

      Object.entries(engines).forEach(([ _, engineData ]) => {
        if(engineData.fuel > 0 && engineData.inOperation){
          engine.velocity += engineData.force
          engineData.fuel -= 1
        }
      })
      
      if( stop ) clearInterval(engineInterval)
  }, 1000/tps)
}

const orbitCanvas = ref<HTMLDivElement>()

onMounted(() => {
  if( !orbitCanvas ) throw new Error("orbitCanvasがないです！！")

  new p5((p: p5) => {
    p.setup = () => {
      p.createCanvas(p.windowWidth * (3/5), p.windowHeight)
      p.rectMode(p.CENTER)
    }
  
    p.draw = () => {
      p.translate(-engine.position.x/minimizeRate + p.width/2, engine.position.y/minimizeRate + p.height/2)
      p.background(0)
      
      p.noFill()
      p.stroke(255)
      p.strokeWeight(2)
      p.circle(0, 0, earthRadius/minimizeRate*2)
  
      p.noStroke()
      p.fill(15, 100, 140)
      engine.history.forEach((history) => {
        p.circle(history.x/minimizeRate, -history.y/minimizeRate, 2)
      })

      p.fill(14, 165, 233)
      p.translate(engine.position.x/minimizeRate, -engine.position.y/minimizeRate)
      const size  = 8
      p.rotate(engine.angle + engine.angleFromEarth)
      p.triangle(
        -size*0.8, size,
        0, -size,
        size*0.8, size
      )
    }
  }, orbitCanvas.value)
})
</script>