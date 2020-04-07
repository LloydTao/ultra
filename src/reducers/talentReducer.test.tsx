import talentReducer, { TalentReducerState } from './talentReducer';
import { createTalent } from '../models/Talent';
import { EXCLUDE_TALENT, INCLUDE_TALENT } from '../actions/types';

// Unit Tests

it("excludes a talent from state", () => {
    let state: TalentReducerState = {
        items: [
            createTalent(0, "My Not Excluded Talent"),
            createTalent(1, "My Excluded Talent"),
            createTalent(2, "My Not Excluded Talent"),
        ]
    }
    let newState = talentReducer(state, {
        type: EXCLUDE_TALENT,
        payload: 1
    });
    expect(newState).toStrictEqual({
        ...state,
        items: state.items.filter(tal => tal.id !== 1)
    })
})

it("includes a talent into its state", () => {
    let newTalent = createTalent(2, "My Not Excluded Talent");
    let state: TalentReducerState = {
        items: [
            createTalent(0, "My Not Excluded Talent"),
            createTalent(1, "My Excluded Talent"),
        ]
    }
    let newState = talentReducer(state, {
        type: INCLUDE_TALENT,
        payload: newTalent
    });
    expect(newState).toStrictEqual({
        ...state,
        items: [
            ...state.items,
            newTalent
        ]
    });
});

it("new talent creates new talent in state", () => {

});

it("delete talent removes talent from state", () => {

});