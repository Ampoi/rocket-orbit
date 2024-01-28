<template>
  <main class="bg-black text-white flex flex-row w-screen h-screen">
    <div ref="orbitCanvas"/>
    <div class="p-4 flex flex-col gap-4 grow">
      <div class="flex flex-col gap-4 border-sky-500/60 text-sky-500 border-[1px] px-4 py-3 grow bg-sky-500/20 rounded-xl">
        <div class="flex flex-col gap-4 grow">
          <div class="flex flex-row gap-4 items-center">
            <p class="font-chakra tracking-wider">VELOCITY</p>
            <input
              type="number"
              class="outline-none text-sky-500 border-b-[1px] px-1.5 py-1 border-sky-500 bg-sky-500/10">
          </div>
          <div class="flex flex-row gap-4 items-center">
            <p class="font-chakra tracking-wider">ANGLE</p>
            <input
              type="number"
              class="outline-none text-sky-500 border-b-[1px] px-1.5 py-1 border-sky-500 bg-sky-500/10">
          </div>
          <div class="flex flex-row gap-4 items-center">
            <p class="font-chakra tracking-wider">HEIGHT</p>
            <input
              type="number"
              class="outline-none text-sky-500 border-b-[1px] px-1.5 py-1 border-sky-500 bg-sky-500/10">
          </div>
        </div>
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
import { onMounted, ref } from "vue";
import { Engine, earthRadius } from "./utils/engine"

const minimizeRate = 10 ** 4 * 5

let engine = new Engine()

const launch = () => {
  engine.start()
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
  
      engine.history.forEach((history) => {
        p.noStroke()
        p.fill(14, 165, 233, 8)
        p.circle(history.x/minimizeRate, -history.y/minimizeRate, 2)
      })
    }
  }, orbitCanvas.value)
})
</script>