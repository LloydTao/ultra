import { Talent } from '../models/Talent';
import IModel from '../models/IModel';
import { NEW_TALENT, DELETE_TALENT, GET_TALENTS } from './types';

let talentModel: IModel<Talent>;

/**
 * Changes how actions will interact with talent data, and how talent data
 * will be stored.
 * @param model A model object that manages talent data.
 */
export const configureModel = (model: IModel<Talent>) => {
    talentModel = model;
}

const assertModelActive = () => {
    if (talentModel === null || talentModel === undefined)
        throw new EvalError("Could not evaluate dispatch action. configureModel() has not been called on this action script.");
}

export const getTalents = () => (dispatch: any) => {
    assertModelActive();
    let talents = talentModel.getAll();
    dispatch({
        type: GET_TALENTS,
        payload: talents
    })
}

export const newTalent = (name: string) => (dispatch: any) => {
    assertModelActive();
    let newTalent = talentModel.create(name);
    dispatch({
        type: NEW_TALENT,
        payload: newTalent
    });
}

export const deleteTalent = (id: number) => (dispatch: any) => {
    assertModelActive();
    talentModel.deleteId(id);
    dispatch({
        type: DELETE_TALENT,
        payload: id
    });
}