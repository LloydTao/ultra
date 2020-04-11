import { Talent, createTalent } from '../models/Talent';
import IModel from '../models/IModel';
import { NEW_TALENT, DELETE_TALENT, GET_TALENTS, UPDATE_TALENT, EXCLUDE_TALENT, INCLUDE_TALENT, CALCULATE_PROGRESSION } from './types';
import { RootState } from '../store';

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
    let newTalent = talentModel.create(createTalent(0, name));
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

export const updateTalent = (talent: Talent) => (dispatch: any) => {
    assertModelActive();
    let modelTalent = talentModel.update(talent);
    dispatch({
        type: UPDATE_TALENT,
        payload: modelTalent
    });
}

export const excludeTalent = (id: number) => (dispatch: any) => {
    dispatch({
        type: EXCLUDE_TALENT,
        payload: id
    });
}

export const includeTalent = (id: number) => (dispatch: any) => {
    assertModelActive();
    let modelTalent = talentModel.get(id);
    dispatch({
        type: INCLUDE_TALENT,
        payload: modelTalent
    });
}

export const calculateTalentProgression = () => (dispatch: any, getState: () => RootState) => {
    const { talents, timer } = getState();
    let talentsData = talents.items;
    let sessionsData = timer.sessions;
    
    if (sessionsData.length === 0)
        return

    if (talentsData.length === 0)
        return

    let currentDate = new Date();
    for (let talent of talentsData) {
        let sessions = sessionsData.filter(s => s.talentId === talent.id);

        if (sessions.length === 0) {
            talent.streakObtained = false;
            talent.expiring = false;
            talent.streakCount = 0;
            continue;
        }

        let reset = new Date(currentDate);
        reset.setHours(4, 0, 0, 0);
        
        // Move back a waking day if we're between the 0 AM - 4 AM time range
        if (currentDate.getTime() <= reset.getTime()) {
            reset.setDate(reset.getDate() - 1);
        }

        let todaysSessions = sessions.filter(s => s.startTimestamp.getTime() >= reset.getTime());
        let todaysHits = todaysSessions.filter(s => {
            if (!s.endTimestamp)
                throw new EvalError("Couldn't calculate talent progression. Two sessions haven't been marked as ended. Data is possibly corrupted.");
                // return false;

            return s.endTimestamp.getTime() - s.startTimestamp.getTime() >= 1800000
        });

        let latestHit = sessions.reduce((cur, next, i, arr) => {
            if (!cur.endTimestamp && !next.endTimestamp)
                throw new EvalError("Couldn't calculate talent progression. Two sessions haven't been marked as ended. Data is possibly corrupted.");

            if (!cur.endTimestamp)
                throw new EvalError("Couldn't calculate talent progression. Transcendent timers aren't implemented yet. Data is possibly corrupted.")
                // return cur;
            
            // Select next if session hasn't ended yet
            if (!next.endTimestamp)
                throw new EvalError("Couldn't calculate talent progression. Transcendent timers aren't implemented yet. Data is possibly corrupted.")
                // return next;

            return next.endTimestamp.getTime() > cur.endTimestamp.getTime() ? next : cur
        });

        // Mark talent as not expiring if latest session hasn't ended yet
        if (!latestHit.endTimestamp) {
            // TODO: Check to see if creating a new talent and refreshing the
            // page throws an exception
            throw new EvalError("Couldn't calculate talent progression. Transcendent timers aren't implemented yet. Data is possibly corrupted.");
            // talent.expiring = false;

            // // Obtain talent streak if started 30 minutes ago and streak
            // //  hasn't been awarded yet
            // if (latestHit.startTimestamp.getTime() >= currentDate.getTime() + (30 * 60 * 1000)
            // &&
            // !talent.streakObtained) {
            //     talent.streakObtained = true;
            //     talent.streakCount++;
            //     talent.progress += talent.progressTarget * 1/7;
            //     // Correct as best we can without level up logic
            //     // TODO: Make levelling up an accessible function, and use it 
            //     // here
            //     talent.progress = Math.min(talent.progress, talent.progressTarget);
            // }
        } else {
            // Mark talent as expiring if past expiry date
            let pastExpiryDate = latestHit.endTimestamp.getTime() <= currentDate.getTime() - (28 * 60 * 60 * 1000);
            talent.expiring = pastExpiryDate;

            talent.streakObtained = todaysHits.length > 0;
        }
    }

    dispatch({
        type: CALCULATE_PROGRESSION,
        payload: {
            talents: talentsData,
            sessions: sessionsData
        }
    });
}