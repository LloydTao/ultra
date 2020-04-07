import { createTalent, Talent } from "./Talent";
import { TalentSession } from "./TalentSession";
import LocalTalentSessionModel from "./LocalTalentSessionModel";
import { TalentIncubator } from "./TalentIncubator";

// Unit Tests

function assertProgressJump(incubator: TalentIncubator, seconds: number, initialTalent: Talent) {
    // Jump time ahead
    jest.spyOn(Date, "now")
        .mockImplementationOnce(() => Date.now() + seconds * 1000);

    let { talent, session } = incubator.poll();

    let expTotalProgressSeconds = talent.progressTarget * 60 * 60;
    let expProgressRate = 1 / expTotalProgressSeconds;
    let expProgress = expProgressRate * seconds;

    expect(talent.progress).toBeCloseTo(expProgress, 7);
    expect(talent.totalSeconds).toBeCloseTo(initialTalent.totalSeconds + seconds);
    expect(session.progressObtained).toBeCloseTo(expProgress, 7);

    return { talent, session }
}

it("progresses a talent", () => {
    let progressor = new TalentIncubator();
    let sessionModel = new LocalTalentSessionModel();

    let testTalent: Talent = createTalent(1, "My Talent", 7, 0, 40);
    let testSession: TalentSession = sessionModel.exchange(testTalent);

    progressor.incubate(testTalent, testSession);

    assertProgressJump(progressor, 1, testTalent);
});

it("stops progressing a talent", () => {
    let incubator = new TalentIncubator();
    let sessionModel = new LocalTalentSessionModel();

    let testTalent: Talent = createTalent(1, "My Talent", 7, 0, 40);
    let testSession: TalentSession = sessionModel.exchange(testTalent);

    incubator.incubate(testTalent, testSession);

    incubator.poll();

    incubator.stop();

    expect(() => incubator.poll()).toThrowError(EvalError);
})