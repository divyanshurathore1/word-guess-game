import { PrismaClient, Difficulty } from '@prisma/client';

const prisma = new PrismaClient();

// Word data organized by difficulty
const wordData = {
  EASY: [
    // 5-10 points - Common, simple words
    { text: 'BAD', points: 5 },
    { text: 'EYE', points: 5 },
    { text: 'SEA', points: 5 },
    { text: 'SUN', points: 5 },
    { text: 'DOG', points: 5 },
    { text: 'CAT', points: 5 },
    { text: 'ICE', points: 5 },
    { text: 'FIRE', points: 6 },
    { text: 'WATER', points: 6 },
    { text: 'TREE', points: 6 },
    { text: 'BOOK', points: 6 },
    { text: 'PHONE', points: 6 },
    { text: 'CHAIR', points: 7 },
    { text: 'TABLE', points: 7 },
    { text: 'MUSIC', points: 7 },
    { text: 'DANCE', points: 7 },
    { text: 'SLEEP', points: 7 },
    { text: 'DREAM', points: 8 },
    { text: 'SMILE', points: 8 },
    { text: 'LAUGH', points: 8 },
    { text: 'GLOVES', points: 5 },
    { text: 'LAYS', points: 8 },
    { text: 'TOMORROW', points: 8 },
    { text: 'IPAD', points: 9 },
    { text: 'WRITE', points: 10 },
    { text: 'HAPPY', points: 6 },
    { text: 'ANGRY', points: 6 },
    { text: 'FAST', points: 5 },
    { text: 'SLOW', points: 5 },
    { text: 'TALL', points: 5 },
    { text: 'SHORT', points: 5 },
    { text: 'FOOD', points: 5 },
    { text: 'DRINK', points: 5 },
    { text: 'WALK', points: 5 },
    { text: 'RUN', points: 5 },
    { text: 'JUMP', points: 6 },
    { text: 'SING', points: 6 },
    { text: 'COOK', points: 6 },
    { text: 'RAIN', points: 6 },
    { text: 'SNOW', points: 6 },
  ],
  
  MEDIUM: [
    // 10-20 points - Moderate difficulty
    { text: 'TOKYO', points: 10 },
    { text: 'PARIS', points: 10 },
    { text: 'LONDON', points: 10 },
    { text: 'PIZZA', points: 10 },
    { text: 'GUITAR', points: 11 },
    { text: 'PIANO', points: 11 },
    { text: 'SOCCER', points: 12 },
    { text: 'TENNIS', points: 12 },
    { text: 'JUNGLE', points: 12 },
    { text: 'DESERT', points: 12 },
    { text: 'CASTLE', points: 13 },
    { text: 'DRAGON', points: 13 },
    { text: 'WIZARD', points: 14 },
    { text: 'ZOMBIE', points: 14 },
    { text: 'VAMPIRE', points: 14 },
    { text: 'NINJA', points: 15 },
    { text: 'PIRATE', points: 15 },
    { text: 'JORDAN', points: 15 },
    { text: 'BRAND', points: 15 },
    { text: 'BOW', points: 15 },
    { text: 'SPICE', points: 15 },
    { text: 'OLYMPICS', points: 16 },
    { text: 'CARNIVAL', points: 16 },
    { text: 'FESTIVAL', points: 17 },
    { text: 'BYE BYE BYE', points: 17 },
    { text: 'VOLCANO', points: 18 },
    { text: 'TSUNAMI', points: 18 },
    { text: 'HURRICANE', points: 19 },
    { text: 'EARTHQUAKE', points: 20 },
    { text: 'SNL', points: 20 },
    { text: 'AFRICA', points: 12 },
    { text: 'AUSTRALIA', points: 13 },
    { text: 'CANADA', points: 11 },
    { text: 'MEXICO', points: 11 },
    { text: 'BRAZIL', points: 12 },
    { text: 'INDIA', points: 10 },
    { text: 'CHINA', points: 10 },
    { text: 'RUSSIA', points: 11 },
    { text: 'GERMANY', points: 12 },
    { text: 'FRANCE', points: 11 },
    { text: 'SPAIN', points: 11 },
    { text: 'ITALY', points: 11 },
    { text: 'BASEBALL', points: 12 },
    { text: 'BASKETBALL', points: 13 },
    { text: 'FOOTBALL', points: 12 },
    { text: 'CRICKET', points: 14 },
    { text: 'SWIMMING', points: 12 },
  ],
  
  HARD: [
    // 20-35 points - Harder concepts
    { text: 'PHOTOSYNTHESIS', points: 22 },
    { text: 'DEMOCRACY', points: 22 },
    { text: 'PHILOSOPHY', points: 23 },
    { text: 'RENAISSANCE', points: 24 },
    { text: 'BABYLON', points: 24 },
    { text: 'METABOLISM', points: 25 },
    { text: 'ALGORITHM', points: 25 },
    { text: 'JACK FROST', points: 26 },
    { text: 'CRYPTOCURRENCY', points: 26 },
    { text: 'BLOCKCHAIN', points: 27 },
    { text: 'NET WORTH', points: 28 },
    { text: 'QUANTUM', points: 28 },
    { text: 'SIMULATION', points: 29 },
    { text: 'HYPOTHESIS', points: 30 },
    { text: 'PARADOX', points: 30 },
    { text: 'NOSTALGIA', points: 31 },
    { text: 'SARCASM', points: 32 },
    { text: 'IRONY', points: 32 },
    { text: 'ENTROPY', points: 33 },
    { text: 'SERENDIPITY', points: 34 },
    { text: 'EPIPHANY', points: 35 },
    { text: 'MONOPOLY', points: 22 },
    { text: 'CAPITALISM', points: 24 },
    { text: 'SOCIALISM', points: 24 },
    { text: 'INFLATION', points: 23 },
    { text: 'RECESSION', points: 24 },
    { text: 'ATMOSPHERE', points: 22 },
    { text: 'ECOSYSTEM', points: 23 },
    { text: 'EVOLUTION', points: 24 },
    { text: 'REVOLUTION', points: 23 },
  ],
  
  EXPERT: [
    // 35-60 points - Very difficult
    { text: 'LIMERENCE', points: 58 },
    { text: 'SONDER', points: 55 },
    { text: 'ZEITGEIST', points: 52 },
    { text: 'ETHEREAL', points: 48 },
    { text: 'EPHEMERAL', points: 46 },
    { text: 'UBIQUITOUS', points: 44 },
    { text: 'JUXTAPOSITION', points: 42 },
    { text: 'ONOMATOPOEIA', points: 40 },
    { text: 'SYNESTHESIA', points: 50 },
    { text: 'SOLIPSISM', points: 54 },
    { text: 'DEFENESTRATION', points: 56 },
    { text: 'PETRICHOR', points: 45 },
    { text: 'PHOSPHENES', points: 48 },
    { text: 'VELLICHOR', points: 52 },
    { text: 'CHRYSALISM', points: 55 },
    { text: 'HIRAETH', points: 50 },
    { text: 'FERNWEH', points: 48 },
    { text: 'HYGGE', points: 42 },
    { text: 'UBUNTU', points: 44 },
    { text: 'WABI SABI', points: 46 },
  ],
};

// Pop culture & proper nouns pack
const popCultureWords = {
  EASY: [
    { text: 'NETFLIX', points: 6 },
    { text: 'SPOTIFY', points: 6 },
    { text: 'GOOGLE', points: 5 },
    { text: 'APPLE', points: 5 },
    { text: 'FACEBOOK', points: 6 },
    { text: 'INSTAGRAM', points: 7 },
    { text: 'TIKTOK', points: 7 },
    { text: 'YOUTUBE', points: 6 },
    { text: 'AMAZON', points: 6 },
    { text: 'TESLA', points: 8 },
    { text: 'DISNEY', points: 6 },
    { text: 'NIKE', points: 5 },
    { text: 'ADIDAS', points: 6 },
    { text: 'COCA COLA', points: 7 },
    { text: 'PEPSI', points: 6 },
  ],
  MEDIUM: [
    { text: 'HOGWARTS', points: 12 },
    { text: 'WAKANDA', points: 14 },
    { text: 'NARNIA', points: 13 },
    { text: 'MORDOR', points: 15 },
    { text: 'TATOOINE', points: 16 },
    { text: 'BEYONCE', points: 12 },
    { text: 'TAYLOR SWIFT', points: 14 },
    { text: 'ELON MUSK', points: 13 },
    { text: 'SQUID GAME', points: 15 },
    { text: 'STRANGER THINGS', points: 16 },
    { text: 'GAME OF THRONES', points: 17 },
    { text: 'BREAKING BAD', points: 15 },
    { text: 'THE OFFICE', points: 12 },
    { text: 'FRIENDS', points: 10 },
    { text: 'MARVEL', points: 10 },
    { text: 'BATMAN', points: 11 },
    { text: 'SUPERMAN', points: 11 },
    { text: 'SPIDER MAN', points: 12 },
    { text: 'IRON MAN', points: 12 },
    { text: 'AVENGERS', points: 13 },
    { text: 'STAR WARS', points: 12 },
    { text: 'HARRY POTTER', points: 13 },
    { text: 'LORD OF THE RINGS', points: 15 },
    { text: 'POKEMON', points: 11 },
    { text: 'MINECRAFT', points: 12 },
    { text: 'FORTNITE', points: 12 },
  ],
  HARD: [
    { text: 'MANDALORIAN', points: 22 },
    { text: 'SEVERANCE', points: 28 },
    { text: 'SUCCESSION', points: 25 },
    { text: 'OPPENHEIMER', points: 24 },
    { text: 'BARBENHEIMER', points: 30 },
    { text: 'METAVERSE', points: 26 },
    { text: 'CHATGPT', points: 22 },
    { text: 'INTERSTELLAR', points: 24 },
    { text: 'INCEPTION', points: 23 },
    { text: 'THE MATRIX', points: 22 },
  ],
  EXPERT: [
    { text: 'KILIMANJARO', points: 40 },
    { text: 'MACHU PICCHU', points: 45 },
    { text: 'CZECHOSLOVAKIA', points: 48 },
    { text: 'LIECHTENSTEIN', points: 52 },
    { text: 'REYKJAVIK', points: 50 },
    { text: 'ANTANANARIVO', points: 55 },
    { text: 'OUAGADOUGOU', points: 58 },
  ],
};

async function main() {
  console.log('🌱 Seeding database...');
  
  // Clear existing data
  await prisma.word.deleteMany();
  await prisma.wordPack.deleteMany();
  
  // Create default word pack
  const defaultPack = await prisma.wordPack.create({
    data: {
      name: 'Default Pack',
      description: 'Standard word pack with varied difficulty',
      isActive: true,
    },
  });
  
  // Insert words for default pack
  for (const [difficulty, words] of Object.entries(wordData)) {
    await prisma.word.createMany({
      data: words.map(w => ({
        text: w.text,
        points: w.points,
        difficulty: difficulty as Difficulty,
        packId: defaultPack.id,
      })),
    });
  }
  
  console.log(`✅ Created default pack with ${Object.values(wordData).flat().length} words`);
  
  // Create pop culture pack
  const popCulturePack = await prisma.wordPack.create({
    data: {
      name: 'Pop Culture',
      description: 'Movies, TV shows, celebrities, and brands',
      isActive: true,
    },
  });
  
  // Insert pop culture words
  for (const [difficulty, words] of Object.entries(popCultureWords)) {
    await prisma.word.createMany({
      data: words.map(w => ({
        text: w.text,
        points: w.points,
        difficulty: difficulty as Difficulty,
        category: 'pop-culture',
        packId: popCulturePack.id,
      })),
    });
  }
  
  console.log(`✅ Created pop culture pack with ${Object.values(popCultureWords).flat().length} words`);
  
  console.log('🎉 Seeding complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
