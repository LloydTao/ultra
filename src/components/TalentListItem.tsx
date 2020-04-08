import React, { useCallback } from "react";

import { Button, Col, Row } from 'reactstrap';
import { useDispatch } from 'react-redux';

import { Talent } from "../models/Talent";
import { startSession } from '../actions/timerActions';
import { deleteTalent } from '../actions/talentActions';
import { medBlue, bodyFont, centerCell } from './constants';
import { ReactComponent as PlayButton } from '../assets/images/PlayButton.svg';
import Ultra from '../components/Ultra';

export type TalentListItemProps = {
    talent: Talent;
}

function TalentListItem(props: TalentListItemProps) {
    const dispatch = useDispatch();
    const deleteTalentMemo = useCallback(
        () => dispatch(deleteTalent(props.talent.id)),
        [dispatch, props.talent]
    );
    const startSessionMemo = useCallback(
        () => dispatch(startSession(props.talent)),
        [dispatch, props.talent]
    );
    const progressDisplayValue = (id: number) => {
        let overflow = props.talent.whiteStars % 3;
        if (overflow == id) return props.talent.progress
        if (overflow > id) return props.talent.progressTarget
        return 0
    }
    return (
        <Row className="mb-3 mx-auto no-gutters" style={{
            maxWidth: "95vw",
            background: "radial-gradient(circle at top left, rgba(142,138,255,1) 0%, rgba(255,74,152,1) 100%)",
            minHeight: "20vh",
            maxHeight: "20vh",
            borderRadius: "20px",
        }}>
            <Col style={{...centerCell}}>
                <div test-id="talentName" style={{
                    ...bodyFont,
                    color: "#FFF",
                    fontSize: "3rem",
                }}>
                    {props.talent.name}
                </div>
            </Col>
            <Col style={{...centerCell}}>
                <Row>
                    <Col>
                        <Ultra progress={progressDisplayValue(0)}
                            progressTarget={props.talent.progressTarget}
                            backgroundOpacity="0.5"
                            />
                    </Col>
                    <Col>
                        <Ultra progress={progressDisplayValue(1)}
                            progressTarget={props.talent.progressTarget}
                            backgroundOpacity="0.5"
                            />
                    </Col>
                    <Col>
                        <Ultra progress={progressDisplayValue(2)}
                            progressTarget={props.talent.progressTarget}
                            backgroundOpacity="0.5"
                            />
                    </Col>
                </Row>
            </Col>
            <Col style={{...centerCell}}>
                <div style={{
                    ...bodyFont,
                    color: "#FFF",
                    fontSize: "3rem"
                }}>
                    LV. {props.talent.whiteStars}
                </div>
                <PlayButton
                    test-id={`talentListItem.${props.talent.id}.startTalent`} 
                    color="success" 
                    onClick={startSessionMemo}
                    style={{
                        cursor: "pointer"
                    }}
                    />
                <Button className="ml-2" color="danger" onClick={deleteTalentMemo}>Delete</Button>
            </Col>
        </Row>
    )
}

export default TalentListItem;