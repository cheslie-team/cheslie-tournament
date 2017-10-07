import React, { Component, PropTypes } from 'react';
import chessboardjs from './vendor/chessboardjs0.3.0/js/chessboard-0.3.0.min.js';
import $ from 'jquery';

window.$ = window.jQuery = $;

class ReactChessBoard extends Component {
    constructor(props) {
        super(props);
        this.cfg = {
            pieceTheme: 'vendor/chessboardjs0.3.0/img/chesspieces/wikipedia/{piece}.png',
            position: 'start'
        };
    }
    componentWillReceiveProps(nextProps) {
        if (nextProps.fen !== this.props.fen)
            this.updatePosition(nextProps.fen)
    }

    updatePosition(fen) {
        if (!this.board) return;
        if (!fen) return;
        this.board.position(fen, false)
    }
    shouldComponentUpdate(nextProps, nextState) {
        return false;
    }

    componentDidMount() {
        if (!this.props.id) {
            return console.warn('ChessBoard: gameId not spessified');
        }
        this.board = ChessBoard(this.props.id, this.cfg);
        this.updatePosition(this.props.fen);
    }

    render(props) {
        return (
            <div id={this.props.id}></div>
        );
    }
}
export default ReactChessBoard;
