beforeAll(() => {
  process.stdout.write('Starting before all tests\n')
  process.stdout.write('Finishing before all tests\n')
})

beforeEach(() => {
  process.stdout.write('Starting before each test\n')
  // Setup before each test
  process.stdout.write('Finishing before each test\n')
})

afterEach(() => {
  process.stdout.write('Starting after each test\n')
  // Cleanup after each test
  process.stdout.write('Finishing after each test\n')
})

afterAll(() => {
  process.stdout.write('Starting after all tests\n')
  // Final cleanup
  process.stdout.write('Finishing after all tests\n')
})
