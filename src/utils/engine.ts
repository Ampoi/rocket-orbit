const { sqrt, sin, cos, atan } = Math

const gravitationalConstant = 6.67 * (10 ** -11) //m**3 / ( kg * (s ** -2) )
export const earthRadius = 6.37 * (10**6) //m
const earthMass = 5.96 * (10**24) //kg
const deltaTime = 0.5 //s

export class Engine {
    velocity = 10000
    angle = 1/3 * Math.PI
    height = 0
    angleFromEarth = 0
    public readonly history: Record<"x" | "y", number>[] = []

    private get gravitationalAcceleration(){
        return gravitationalConstant * earthMass / ( ( this.height + earthRadius ) ** 2 )
    }

    public get position(){
        return {
          x: (earthRadius + this.height) * sin(this.angleFromEarth),
          y: (earthRadius + this.height) * cos(this.angleFromEarth)
        }
    }

    private episode(): true | void {
        const horizontalVelocity            = this.velocity * sin(this.angle)
        const horizontalDisplacementAmount  = horizontalVelocity * deltaTime

        const verticalVelocity            = this.velocity * cos(this.angle) - this.gravitationalAcceleration * deltaTime
        const verticalDisplacementAmount  = verticalVelocity * deltaTime

        this.velocity = sqrt(horizontalVelocity ** 2 + verticalVelocity ** 2)

        const newAngle = atan(horizontalVelocity / verticalVelocity)
        this.angle = newAngle < 0 ? newAngle + Math.PI : newAngle

        this.angleFromEarth += atan(horizontalDisplacementAmount / (earthRadius + this.height + verticalDisplacementAmount))
        this.height = sqrt(horizontalDisplacementAmount ** 2 + (earthRadius + this.height + verticalDisplacementAmount) ** 2) - earthRadius

        if( this.height < 0 ){ return true }

        this.history.push(this.position)
    }

    public start(){
        const tps = 100/deltaTime
        const interval = setInterval(() => {
            const stop = this.episode()
            if( stop ) clearInterval(interval)
        }, 1000/tps)
    }
}