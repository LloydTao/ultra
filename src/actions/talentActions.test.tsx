import { newTalent, deleteTalent, getTalents, configureModel, updateTalent, excludeTalent, includeTalent, calculateTalentProgression }  from './talentActions';
import { NEW_TALENT, DELETE_TALENT, GET_TALENTS, UPDATE_TALENT, EXCLUDE_TALENT, INCLUDE_TALENT, CALCULATE_PROGRESSION } from './types';
import jokeDispatch from '../testutils/jokeDispatch';
import { createTalent, Talent, cloneTalent } from '../models/Talent';
import IModel from '../models/IModel';
import LocalTalentModel from '../models/LocalTalentModel';
import { createSession, TalentSession } from '../models/TalentSession';
import { RootState } from '../store';
import { advanceTo } from 'jest-date-mock';

let testTalents: Talent[];
let model: IModel<Talent>;

class MockTalentModel implements IModel<Talent> {
    create(element: Talent): Talent {
        throw new Error("Method not implemented.");
    }
    getAll(): Talent[] {
        throw new Error("Method not implemented.");
    }
    get(id: number): Talent {
        throw new Error("Method not implemented.");
    }
    update(element: Talent): Talent {
        throw new Error("Method not implemented.");
    }
    delete(element: Talent): void {
        throw new Error("Method not implemented.");
    }
    deleteId(id: number): void {
        throw new Error("Method not implemented.");
    }
}

// Unit Tests

it("dispatches exclude request correctly", () => {
    let dis = jokeDispatch(excludeTalent(1));
    expect(dis).toBeCalledWith({
        type: EXCLUDE_TALENT,
        payload: 1
    })
})

it("dispatches include request correctly", () => {
    let testTalent = createTalent(1, "Hooray", 7);
    class TestTalentModel extends MockTalentModel {
        get(id: number): Talent {
            if (id === 1) {
                return testTalent;
            }

            throw new Error("Unexpected get call received.");
        }
    }
    configureModel(new TestTalentModel());

    let dis = jokeDispatch(includeTalent(1));
    expect(dis).toBeCalledWith({
        type: INCLUDE_TALENT,
        payload: testTalent
    });
})

// Progression Tests
// 
// To see key information regarding terminology or rules of the progression
// system, seek the wiki for answers.

it("flags talent as streak obtained when a hit starts just after beginning of waking day", () => {
    advanceTo(new Date(2020, 3, 21, 8, 0, 0));

    let testTalents = [
        createTalent(0, "Programming", 7, 0, 40, 0, 0, 0, false, false)
    ]
    expect(testTalents[0].streakObtained).toBeFalsy();

    let today = new Date();

    let yesterdayEnd = new Date(today);
    yesterdayEnd.setHours(4, 30, 0, 0);

    let yesterdayStart = new Date(yesterdayEnd);
    yesterdayStart.setHours(4, 0, 0, 0);

    let testSessions = [
        createSession(0, 0, 7, yesterdayStart, yesterdayEnd)
    ]
    let expectedTalent = cloneTalent(testTalents[0]);
    expectedTalent.streakObtained = true;
    expect(expectedTalent).not.toEqual(testTalents[0]);
    expect(expectedTalent).not.toStrictEqual(testTalents[0]);
    let expectedTalents = [
        expectedTalent
    ]

    let state: () => RootState = () => ({
        talents: {
            items: testTalents,
            lastBeginsEditing: false
        },
        timer: {
            session: {
                talent: null,
                session: null
            },
            sessions: testSessions
        }
    })

    expect(jokeDispatch(calculateTalentProgression(), state)).toBeCalledWith({
        type: CALCULATE_PROGRESSION,
        payload: {
            talents: expectedTalents,
            sessions: testSessions
        }
    })
});

it("flags talent as streak obtained when a hit starts and ends just before the end of a waking day", () => {
    advanceTo(new Date(2020, 3, 21, 3, 59, 59, 999));

    let testTalents = [
        createTalent(0, "Programming", 7, 0, 40, 0, 0, 0, false, false)
    ]
    expect(testTalents[0].streakObtained).toBeFalsy();

    let today = new Date();

    let yesterdayEnd = new Date(today);
    yesterdayEnd.setHours(3, 59, 59, 999);

    let yesterdayStart = new Date(yesterdayEnd);
    yesterdayStart.setHours(3, 29, 59, 999);

    let testSessions = [
        createSession(0, 0, 7, yesterdayStart, yesterdayEnd)
    ]
    let expectedTalent = cloneTalent(testTalents[0]);
    expectedTalent.streakObtained = true;
    expect(expectedTalent).not.toEqual(testTalents[0]);
    expect(expectedTalent).not.toStrictEqual(testTalents[0]);
    let expectedTalents = [
        expectedTalent
    ]

    let state: () => RootState = () => ({
        talents: {
            items: testTalents,
            lastBeginsEditing: false
        },
        timer: {
            session: {
                talent: null,
                session: null
            },
            sessions: testSessions
        }
    })

    expect(jokeDispatch(calculateTalentProgression(), state)).toBeCalledWith({
        type: CALCULATE_PROGRESSION,
        payload: {
            talents: expectedTalents,
            sessions: testSessions
        }
    })
})

function createSessionWithinWakingDay(id: number, startHoursComp: number[], sessionDuration: number[], date: Date = new Date()): TalentSession {
    let yesterdayStart = new Date(date);
    yesterdayStart.setHours(startHoursComp[0], ...startHoursComp.slice(1));

    // Add duration offsets to start hours to get end times
    for (let i = 0; i < startHoursComp.length && i < sessionDuration.length; i++) {
        sessionDuration[i] = startHoursComp[i] + sessionDuration[i]
    }

    let yesterdayEnd = new Date(yesterdayStart);
    yesterdayEnd.setHours(sessionDuration[0], ...sessionDuration.slice(1));

    return createSession(id, 0, 7, yesterdayStart, yesterdayEnd);
}

it("flags talent as streak not obtained when there are several sessions which are not hits within the waking day", () => {
    advanceTo(new Date(2020, 3, 21, 8, 0, 0, 0));

    let testTalents = [
        createTalent(0, "Programming", 7, 0, 40, 0, 0, 0, true, false)
    ]
    expect(testTalents[0].streakObtained).toBeTruthy();

    let s1 = createSessionWithinWakingDay(0, [5], [0, 20]);
    let s2 = createSessionWithinWakingDay(1, [6], [0, 29, 59, 999]);

    let testSessions = [
        s1,
        s2
    ]
    let expectedTalent = cloneTalent(testTalents[0]);

    expectedTalent.streakObtained = false;

    expect(expectedTalent).not.toEqual(testTalents[0]);
    expect(expectedTalent).not.toStrictEqual(testTalents[0]);
    let expectedTalents = [
        expectedTalent
    ]

    let state: () => RootState = () => ({
        talents: {
            items: testTalents,
            lastBeginsEditing: false
        },
        timer: {
            session: {
                talent: null,
                session: null
            },
            sessions: testSessions
        }
    })

    expect(jokeDispatch(calculateTalentProgression(), state)).toBeCalledWith({
        type: CALCULATE_PROGRESSION,
        payload: {
            talents: expectedTalents,
            sessions: testSessions
        }
    })
});

it("flags talent as streak not obtained when there are no sessions within the waking day", () => {
    advanceTo(new Date(2020, 3, 21, 8, 0, 0, 0));

    let testTalents = [
        createTalent(0, "Programming", 7, 0, 40, 0, 0, 0, true, false)
    ]
    expect(testTalents[0].streakObtained).toBeTruthy();

    let today = new Date();
    let s1 = createSessionWithinWakingDay(0, [3], [0, 20], today);
    let s2 = createSessionWithinWakingDay(1, [2, 29, 59, 999], [0, 30], today);

    let testSessions = [
        s1,
        s2
    ]
    let expectedTalent = cloneTalent(testTalents[0]);

    expectedTalent.streakObtained = false;

    expect(expectedTalent).not.toEqual(testTalents[0]);
    expect(expectedTalent).not.toStrictEqual(testTalents[0]);
    let expectedTalents = [
        expectedTalent
    ]

    let state: () => RootState = () => ({
        talents: {
            items: testTalents,
            lastBeginsEditing: false
        },
        timer: {
            session: {
                talent: null,
                session: null
            },
            sessions: testSessions
        }
    })

    expect(jokeDispatch(calculateTalentProgression(), state)).toBeCalledWith({
        type: CALCULATE_PROGRESSION,
        payload: {
            talents: expectedTalents,
            sessions: testSessions
        }
    })
})

it("flags talent as streak not obtained when hit starts just before the beginning of the waking day and ends after the beginning of the waking day", () => {
    advanceTo(new Date(2020, 3, 21, 5, 0, 0, 0));

    let testTalents = [
        createTalent(0, "Programming", 7, 0, 40, 0, 0, 0, true, false)
    ]
    expect(testTalents[0].streakObtained).toBeTruthy();

    let today = new Date();

    let yesterdayEnd = new Date(today);
    yesterdayEnd.setHours(4, 0, 0, 0);

    let yesterdayStart = new Date(yesterdayEnd);
    yesterdayStart.setTime(yesterdayEnd.getTime() - (30*60*1000));

    let testSessions = [
        createSession(0, 0, 7, yesterdayStart, yesterdayEnd)
    ]
    let expectedTalent = cloneTalent(testTalents[0]);

    expectedTalent.streakObtained = false;

    expect(expectedTalent).not.toEqual(testTalents[0]);
    expect(expectedTalent).not.toStrictEqual(testTalents[0]);
    let expectedTalents = [
        expectedTalent
    ]

    let state: () => RootState = () => ({
        talents: {
            items: testTalents,
            lastBeginsEditing: false
        },
        timer: {
            session: {
                talent: null,
                session: null
            },
            sessions: testSessions
        }
    })

    expect(jokeDispatch(calculateTalentProgression(), state)).toBeCalledWith({
        type: CALCULATE_PROGRESSION,
        payload: {
            talents: expectedTalents,
            sessions: testSessions
        }
    })
});

it("flags a talent as not expiring when a streak hit ended just under 28 hours ago", () => {
    advanceTo(new Date(2020, 3, 21, 8, 0, 0));

    let testTalents = [
        createTalent(0, "Programming", 7, 0, 40, 0, 0, 0, false, true)
    ]
    expect(testTalents[0].expiring).toBeTruthy();
    expect(testTalents[0].streakObtained).toBeFalsy();

    let today = new Date();

    let yesterdayEnd = new Date(today);
    yesterdayEnd.setDate(yesterdayEnd.getDate() - 1);
    // Go backwards 4 hours
    yesterdayEnd.setTime(yesterdayEnd.getTime() - (4 * 60 * 60 * 1000));
    // Plus 1 ms to fall within non-expiration boundary
    yesterdayEnd.setTime(yesterdayEnd.getTime() + 1);

    let yesterdayStart = new Date(yesterdayEnd);
    yesterdayStart.setTime(yesterdayEnd.getTime() - (30*60*1000));

    let testSessions = [
        createSession(0, 0, 7, yesterdayStart, yesterdayEnd)
    ]
    let expectedTalent = cloneTalent(testTalents[0]);
    expectedTalent.expiring = false;
    expect(expectedTalent).not.toEqual(testTalents[0]);
    expect(expectedTalent).not.toStrictEqual(testTalents[0]);
    let expectedTalents = [
        expectedTalent
    ]

    let state: () => RootState = () => ({
        talents: {
            items: testTalents,
            lastBeginsEditing: false
        },
        timer: {
            session: {
                talent: null,
                session: null
            },
            sessions: testSessions
        }
    })

    expect(jokeDispatch(calculateTalentProgression(), state)).toBeCalledWith({
        type: CALCULATE_PROGRESSION,
        payload: {
            talents: expectedTalents,
            sessions: testSessions
        }
    })
});

it("flags a talent as expiring when one streak hit ended more than 28 hours ago", () => {
    // Expiring means a streak hit hasn't been made 28 hours after its last
    // last streak hit.
    advanceTo(new Date(2020, 3, 21, 8, 0, 0));

    let testTalents = [
        createTalent(0, "Programming", 7, 0, 40, 0, 0, 0, true, false)
    ]
    expect(testTalents[0].expiring).toBeFalsy();
    expect(testTalents[0].streakObtained).toBeTruthy();

    let today = new Date();

    let yesterdayEnd = new Date(today);
    yesterdayEnd.setDate(yesterdayEnd.getDate() - 1);
    // Go backwards 4 hours
    yesterdayEnd.setTime(yesterdayEnd.getTime() - (4*60*60*1000));
    // Minus 1 milliseconds to fall within boundary
    yesterdayEnd.setTime(yesterdayEnd.getTime() - 1);

    let yesterdayStart = new Date(yesterdayEnd);
    yesterdayStart.setTime(yesterdayEnd.getTime() - (30*60*1000));

    let testSessions = [
        createSession(0, 0, 7, yesterdayStart, yesterdayEnd)
    ]
    let expectedTalent = cloneTalent(testTalents[0]);
    expectedTalent.expiring = true;
    expectedTalent.streakObtained = false;
    expect(expectedTalent).not.toEqual(testTalents[0]);
    expect(expectedTalent).not.toStrictEqual(testTalents[0]);
    let expectedTalents = [
        expectedTalent
    ]

    let state: () => RootState = () => ({
        talents: {
            items: testTalents,
            lastBeginsEditing: false
        },
        timer: {
            session: {
                talent: null,
                session: null
            },
            sessions: testSessions
        }
    })

    expect(jokeDispatch(calculateTalentProgression(), state)).toBeCalledWith({
        type: CALCULATE_PROGRESSION,
        payload: {
            talents: expectedTalents,
            sessions: testSessions
        }
    })
});

// Integration Tests

beforeEach(() => {
    testTalents = [
        createTalent(0, "Programming"),
        createTalent(1, "Music Creation")
    ]
    model = new LocalTalentModel(testTalents);
    configureModel(model);
})

afterEach(() => {
    model = null;
    configureModel(null);
})

it("creates talent with correct dispatch", () => {
    let expectedTalent = createTalent(2, "My Talent");
    let dis = jokeDispatch(newTalent("My Talent"));
    expect(dis).toBeCalledWith({
        type: NEW_TALENT,
        payload: expectedTalent
    });
})

it("deletes talent with correct dispatch", () => {
    let dis = jokeDispatch(deleteTalent(7));
    expect(dis).toBeCalledWith({
        type: DELETE_TALENT,
        payload: 7
    })
})

it("gets talents with correct dispatch", () => {
    let dis = jokeDispatch(getTalents());
    expect(dis).toBeCalledWith({
        type: GET_TALENTS,
        payload: testTalents
    });
})

it("updates talents with correct dispatch", () => {
    let testTalent = testTalents[0];
    let dis = jokeDispatch(updateTalent(testTalent));
    expect(dis).toBeCalledWith({
        type: UPDATE_TALENT,
        payload: testTalent
    });
});

it("updates talent in model", () => {
    let testTalent = testTalents[0];
    let modelTalent = model.get(testTalent.id);

    expect(testTalent.name).not.toBe("Breakdancing");
    expect(modelTalent.name).not.toBe("Breakdancing");
    expect(modelTalent).toStrictEqual(testTalent);

    testTalent.name = "Breakdancing";

    expect(modelTalent.name).not.toBe("Breakdancing");
    expect(modelTalent).not.toStrictEqual(testTalent);

    jokeDispatch(updateTalent(testTalent));

    modelTalent = model.get(testTalent.id);
    
    expect(modelTalent).not.toBe(testTalent);
    expect(modelTalent).toStrictEqual(testTalent);
})

it("new talent creates new talent in state", () => {

});

it("new talent is saved across page reloads", () => {

});

it("deletes talent from ", () => {

})

it("delete talent is saved across page reloads", () => {
    
});