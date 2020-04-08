import React, { useCallback } from 'react';

import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Button, Row, Col } from 'reactstrap';

import { Talent } from '../models/Talent';
import { pollSession, stopSession } from '../actions/timerActions';
import { TalentSession } from '../models/TalentSession';
import { medBlue, bodyFont, centerCell, cGhostBlue } from './constants';
import { ReactComponent as StopButton } from '../assets/images/StopButton.svg';
import Ultra from '../components/Ultra';

type TalentTimerProps = {
    talent: Talent | null,
    session: TalentSession | null
}

function TalentTimer(props: TalentTimerProps) {
    let timing = props.talent !== null && props.session !== null;

    const dispatch = useDispatch();
    const [ timer, setTimer ] = useState<NodeJS.Timeout>();

    if (timing && !timer) {
        setTimer(
            setInterval(() => {
                dispatch(pollSession())
            }, 200)
        );
    }

    if (!timing && timer) {
        clearInterval(timer);
        setTimer(undefined);
    }

    if (timing)
        return <TalentProgress talent={props.talent!} />
    else
        return <TalentPlaceholder />
}

type TalentProgressProps  = {
    talent: Talent
}

function TalentProgress(props: TalentProgressProps) {
    const dispatch = useDispatch();
    const stop = useCallback((e: React.MouseEvent) => {
        dispatch(stopSession());
    }, [dispatch])

    const progressDisplayValue = (id: number) => {
        let overflow = props.talent.whiteStars % 3;
        if (overflow == id) return props.talent.progress
        if (overflow > id) return props.talent.progressTarget
        return 0
    }

    return (
        <Row className="mb-3 mx-auto no-gutters" style={{
            maxWidth: "95vw",
            minHeight: "20vh",
            maxHeight: "20vh",
            borderRadius: "20px",
            background: "radial-gradient(circle at top left, rgba(142,138,255,1) 0%, rgba(69,62,255,1) 75%, rgba(69,62,255,1) 100%)",
        }}>
            <Col style={{...centerCell}}>
                <div test-id="talentTimer.talentName" className="title"
                    style={{...bodyFont,
                        color: "#FFF",
                        fontSize: "3rem"}}>
                    {props.talent.name}
                </div>
            </Col>
            <Col style={{...centerCell}}>
                {/* <div style={{...bodyFont,
                    color: "#FFF",
                    fontSize: "3rem"}}>
                    {(props.talent.progress / props.talent.progressTarget) * 100}%
                </div> */}
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
                <StopButton
                    test-id="talentTimer.stop"
                    onClick={stop}
                    fill="#FFF"
                    style={{
                        cursor: "pointer"
                    }}
                    />
            </Col>
        </Row>
    )
}

function TalentPlaceholder() {
    return (
        <Row className="mb-3 mx-auto no-gutters" style={{
            maxWidth: "95vw",
            minHeight: "20vh",
            maxHeight: "20vh",
            borderStyle: "dashed",
            borderColor: "#D7D6FF",
            borderWidth: "7px",
            borderRadius: "20px"
        }}>
            <Col style={{
                ...bodyFont,
                ...medBlue,
                ...centerCell,
                fontSize: "3rem"
            }}>
                Start a talent to begin earning ultra.
            </Col>
            <Col style={{...centerCell}}>
                <Row>
                    <Col>
                        <Ultra progress={0}
                            progressTarget={1}
                            />
                    </Col>
                    <Col>
                        <Ultra progress={0}
                            progressTarget={1}
                            />
                    </Col>
                    <Col>
                        <Ultra progress={0}
                            progressTarget={1}
                            />
                    </Col>
                </Row>
            </Col>
            <Col style={{...centerCell}}>
                <StopButton fill={cGhostBlue} />
            </Col>
        </Row>
    )
}

export default TalentTimer;