import { prisma } from "@/lib/prisma"

const users = [
  {
    id: "cmv41b5tw0001356t2j70z2i9",
    name: "Danilo Duzzi",
    role: "user",
  },
  {
    id: "cmv41b9zx0003356tkd0p4whr",
    name: "Rogerio Lima",
    role: "user",
  },
  {
    id: "cmv41binp0005356tnsf9w0pn",
    name: "Andre Gonçalves",
    role: "admin",
  },
]
const resources = [
  { id: "cmv41tc3x000h356tms2hithf", name: "projetor" },
  { id: "cmv41tfhi000j356tjiegrhyl", name: "ar condicionado" },
]
const rooms = [
  {
    id: "cmv41clr70007356t91mynwjk",
    name: "Sala Terra",
    capacity: 26,
    resources: { connect: [{ id: "cmv41tc3x000h356tms2hithf" }] },
  },
  {
    id: "cmv41d1gy0009356tdeexizso",
    name: "Sala Saturno",
    capacity: 34,
    resources: { connect: [{ id: "cmv41tfhi000j356tjiegrhyl" }] },
  },
  {
    id: "cmv41d8an000b356tk8fnvooo",
    name: "Sala Urano",
    capacity: 41,
    resources: {
      connect: [
        { id: "cmv41tc3x000h356tms2hithf" },
        { id: "cmv41tfhi000j356tjiegrhyl" },
      ],
    },
  },
  {
    id: "cmv41hdeq000d356t9vrv707j",
    name: "Sala Netuno",
    capacity: 20,
    resources: { connect: [{ id: "cmv41tc3x000h356tms2hithf" }] },
  },
  {
    id: "cmv41hgqg000f356tzzbdkq1g",
    name: "Sala Mercúrio",
    capacity: 12,
    resources: { connect: [{ id: "cmv41tfhi000j356tjiegrhyl" }] },
  },
]

async function seed() {
  for await (const user of users) {
    await prisma.user.upsert({
      where: { id: user.id },
      update: {},
      create: user,
    })
  }
  for await (const resource of resources) {
    await prisma.resource.upsert({
      where: { name: resource.name },
      update: {},
      create: resource,
    })
  }
  for await (const room of rooms) {
    await prisma.room.upsert({
      where: { id: room.id },
      update: {},
      create: room,
    })
  }
}

async function main() {
  try {
    await seed()
    console.log("Database seed!")
  } catch (error) {
    console.error("Database seed failed:", error)
    process.exitCode = 1
  } finally {
    await prisma.$disconnect()
  }
}

void main()
