import React, { Component, PropTypes } from 'react';
import chessboardjs from './vendor/chessboardjs0.3.0/js/chessboard-0.3.0.min.js';
import $ from 'jquery';

window.$ = window.jQuery = $;

class ReactChessBoard extends Component {
    constructor(props) {
        super(props);
        this.board;
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
        this.board = ChessBoard('board', this.cfg);
        this.renderChessBoard(this.props.fen);
    }

    shouldComponentUpdate(nextProps, nextState) {
        return false;
    }

    render(props) {
        return (
            <div id={'board'} >
                ChessBoard</div>
        );
    }
    renderChessBoard() {

    }
}
export default ReactChessBoard;
