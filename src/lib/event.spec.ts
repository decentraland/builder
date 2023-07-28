import { EventMethod, preventDefault, stopPropagation } from './event'

describe.each([preventDefault, stopPropagation])('when wrapping a handler with %s', fn => {
  let handler: jest.Mock
  let event: Event

  const eventMethod = fn.name as EventMethod<typeof event>

  beforeEach(() => {
    handler = jest.fn()
    event = {
      [eventMethod]: jest.fn()
    } as unknown as Event
  })

  describe('and the handler is defined', () => {
    describe('and the event is defined', () => {
      beforeEach(() => {
        fn(handler)(event)
      })

      it(`should execute the ${eventMethod} method from the event`, () => {
        expect(event[eventMethod]).toHaveBeenCalled()
      })

      it('should call the handler', () => {
        expect(handler).toHaveBeenCalled()
      })
    })

    describe('and the event is not defined', () => {
      beforeEach(() => {
        fn(handler)()
      })

      it(`should not execute the ${eventMethod} method from the event`, () => {
        expect(event[eventMethod]).not.toHaveBeenCalled()
      })

      it('should call the handler', () => {
        expect(handler).toHaveBeenCalled()
      })
    })
  })

  describe('and the handler is not defined', () => {
    describe('and the event is defined', () => {
      beforeEach(() => {
        fn(undefined)(event)
      })

      it(`should execute the ${eventMethod} method from the event`, () => {
        expect(event[eventMethod]).toHaveBeenCalled()
      })

      it('should not call the handler', () => {
        expect(handler).not.toHaveBeenCalled()
      })
    })

    describe('and the event is not defined', () => {
      beforeEach(() => {
        fn(undefined)()
      })

      it(`should not execute the ${eventMethod} method from the event`, () => {
        expect(event[eventMethod]).not.toHaveBeenCalled()
      })

      it('should not call the handler', () => {
        expect(handler).not.toHaveBeenCalled()
      })
    })
  })
})
