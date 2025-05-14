// 초기 데이터 및 전역 변수
const HASHTAG_SUGGESTIONS = ['#성장', '#연대', '#사랑', '#평화', '#자유', '#정의', '#창의', '#지혜', '#성실', '#감사'];
const DAILY_SUBMISSION_LIMIT = 5;
let values = JSON.parse(localStorage.getItem('values')) || [];
let activeTab = 'all';

// DOM 요소
const valueForm = document.getElementById('value-form');
const valueInput = document.getElementById('value-input');
const hashtagSuggestions = document.getElementById('hashtag-suggestions');
const submissionLimitMessage = document.getElementById('submission-limit-message');
const valuesList = document.getElementById('values-list');
const tabButtons = document.querySelectorAll('.tab-btn');

// 초기화 함수
function init() {
    renderHashtagSuggestions();
    checkSubmissionLimit();
    renderValues();
    
    // 이벤트 리스너 설정
    valueForm.addEventListener('submit', handleValueSubmit);
    valueInput.addEventListener('input', handleValueInput);
    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            activeTab = btn.dataset.tab;
            setActiveTab(btn);
            renderValues();
        });
    });
}

// 해시태그 제안 렌더링
function renderHashtagSuggestions() {
    hashtagSuggestions.innerHTML = '';
    HASHTAG_SUGGESTIONS.forEach(tag => {
        const tagElement = document.createElement('span');
        tagElement.classList.add('hashtag');
        tagElement.textContent = tag;
        tagElement.addEventListener('click', () => {
            valueInput.value += ` ${tag}`;
            valueInput.focus();
        });
        hashtagSuggestions.appendChild(tagElement);
    });
}

// 입력 처리 함수
function handleValueInput(e) {
    // 필요 시 해시태그 자동 완성 로직 추가
}

// 가치관 제출 처리
function handleValueSubmit(e) {
    e.preventDefault();
    
    if (!canSubmitToday()) {
        submissionLimitMessage.textContent = `하루 ${DAILY_SUBMISSION_LIMIT}회 한정입니다.`;
        return;
    }
    
    const valueText = valueInput.value.trim();
    if (!valueText) return;
    
    // 해시태그 추출
    const hashtags = [];
    const words = valueText.split(' ');
    const cleanedText = words.filter(word => {
        if (word.startsWith('#')) {
            hashtags.push(word);
            return false;
        }
        return true;
    }).join(' ');
    
    // 가치관 객체 생성
    const newValue = {
        id: Date.now().toString(),
        text: cleanedText,
        hashtags: hashtags,
        date: new Date().toISOString(),
        likes: 0,
        likedBy: [],
        comments: []
    };
    
    // 데이터 저장
    values.unshift(newValue);
    saveValues();
    
    // 폼 리셋 및 UI 업데이트
    valueInput.value = '';
    checkSubmissionLimit();
    renderValues();
}

// 하루 제출 수 체크
function canSubmitToday() {
    const today = new Date().toDateString();
    const todaysSubmissions = values.filter(v => {
        const valueDate = new Date(v.date).toDateString();
        return valueDate === today;
    }).length;
    
    return todaysSubmissions < DAILY_SUBMISSION_LIMIT;
}

// 제출 제한 체크 및 UI 업데이트
function checkSubmissionLimit() {
    if (!canSubmitToday()) {
        submissionLimitMessage.textContent = `오늘은 이미 ${DAILY_SUBMISSION_LIMIT}개의 가치관을 등록했습니다.`;
        valueForm.querySelector('button').disabled = true;
    } else {
        const today = new Date().toDateString();
        const todaysSubmissions = values.filter(v => {
            const valueDate = new Date(v.date).toDateString();
            return valueDate === today;
        }).length;
        
        submissionLimitMessage.textContent = `오늘 ${todaysSubmissions}/${DAILY_SUBMISSION_LIMIT}개 가치관 등록됨`;
        valueForm.querySelector('button').disabled = false;
    }
}

// 탭 활성화
function setActiveTab(clickedTab) {
    tabButtons.forEach(btn => btn.classList.remove('active'));
    clickedTab.classList.add('active');
}

// 데이터 저장
function saveValues() {
    localStorage.setItem('values', JSON.stringify(values));
}

// 가치관 렌더링
function renderValues() {
    valuesList.innerHTML = '';
    
    let filteredValues = [...values];
    
    // 탭에 따른 필터링
    if (activeTab === 'today') {
        const today = new Date().toDateString();
        filteredValues = filteredValues.filter(v => {
            const valueDate = new Date(v.date).toDateString();
            return valueDate === today;
        });
        // 오늘의 TOP 10으로 제한
        filteredValues.sort((a, b) => b.likes - a.likes);
        filteredValues = filteredValues.slice(0, 10);
    } else if (activeTab === 'weekly') {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        filteredValues = filteredValues.filter(v => {
            const valueDate = new Date(v.date);
            return valueDate >= weekAgo;
        });
        // 좋아요순 정렬
        filteredValues.sort((a, b) => b.likes - a.likes);
    }
    
    if (filteredValues.length === 0) {
        valuesList.innerHTML = '<p class="no-values">표시할 가치관이 없습니다.</p>';
        return;
    }
    
    filteredValues.forEach(value => {
        const cardElement = createValueCard(value);
        valuesList.appendChild(cardElement);
    });
}

// 가치관 카드 생성
function createValueCard(value) {
    const template = document.getElementById('value-card-template');
    const cardClone = document.importNode(template.content, true);
    
    // 카드 내용 채우기
    const card = cardClone.querySelector('.value-card');
    card.id = `value-${value.id}`;
    
    const valueText = card.querySelector('.value-text');
    valueText.textContent = value.text;
    
    const hashtagsContainer = card.querySelector('.value-hashtags');
    value.hashtags.forEach(tag => {
        const tagElement = document.createElement('span');
        tagElement.classList.add('hashtag');
        tagElement.textContent = tag;
        hashtagsContainer.appendChild(tagElement);
    });
    
    const dateElement = card.querySelector('.value-date');
    dateElement.textContent = formatDate(value.date);
    
    // 좋아요 버튼 설정
    const likeBtn = card.querySelector('.like-btn');
    const likeCount = likeBtn.querySelector('.like-count');
    likeCount.textContent = value.likes;
    
    // 사용자가 이미 좋아요 했는지 확인
    const userId = getUserId();
    if (value.likedBy.includes(userId)) {
        likeBtn.classList.add('liked');
    }
    
    // 좋아요 이벤트 설정
    likeBtn.addEventListener('click', () => {
        handleLike(value.id, likeBtn);
    });
    
    // 댓글 버튼 설정
    const commentBtn = card.querySelector('.comment-btn');
    const commentsSection = card.querySelector('.comments-section');
    
    commentBtn.addEventListener('click', () => {
        commentsSection.style.display = commentsSection.style.display === 'none' ? 'block' : 'none';
        
        if (commentsSection.style.display === 'block') {
            renderComments(value.id, commentsSection.querySelector('.comments-list'));
        }
    });
    
    // 댓글 입력 이벤트 설정
    const commentInput = commentsSection.querySelector('.comment-text');
    const postCommentBtn = commentsSection.querySelector('.post-comment-btn');
    
    postCommentBtn.addEventListener('click', () => {
        const commentText = commentInput.value.trim();
        if (commentText) {
            addComment(value.id, commentText);
            commentInput.value = '';
            renderComments(value.id, commentsSection.querySelector('.comments-list'));
        }
    });
    
    // 리액션 버튼 이벤트 설정
    const reactionBtns = commentsSection.querySelectorAll('.reaction-btn');
    reactionBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const emoji = btn.dataset.emoji;
            addComment(value.id, emoji);
            renderComments(value.id, commentsSection.querySelector('.comments-list'));
        });
    });
    
    return card;
}

// 좋아요 처리
function handleLike(valueId, likeBtn) {
    const userId = getUserId();
    const valueIndex = values.findIndex(v => v.id === valueId);
    
    if (valueIndex < 0) return;
    
    const value = values[valueIndex];
    
    // 이미 좋아요 했는지 확인
    const alreadyLiked = value.likedBy.includes(userId);
    
    if (alreadyLiked) {
        // 좋아요 취소
        value.likes = Math.max(0, value.likes - 1);
        value.likedBy = value.likedBy.filter(id => id !== userId);
        likeBtn.classList.remove('liked');
    } else {
        // 좋아요 추가
        value.likes += 1;
        value.likedBy.push(userId);
        likeBtn.classList.add('liked');
    }
    
    // 좋아요 수 업데이트
    likeBtn.querySelector('.like-count').textContent = value.likes;
    
    // 데이터 저장
    saveValues();
}

// 댓글 추가
function addComment(valueId, commentText) {
    const valueIndex = values.findIndex(v => v.id === valueId);
    
    if (valueIndex < 0) return;
    
    const comment = {
        id: Date.now().toString(),
        text: commentText,
        date: new Date().toISOString()
    };
    
    values[valueIndex].comments.push(comment);
    saveValues();
}

// 댓글 렌더링
function renderComments(valueId, commentsListElement) {
    const valueIndex = values.findIndex(v => v.id === valueId);
    
    if (valueIndex < 0) return;
    
    const comments = values[valueIndex].comments;
    commentsListElement.innerHTML = '';
    
    if (comments.length === 0) {
        commentsListElement.innerHTML = '<p class="no-comments">아직 댓글이 없습니다.</p>';
        return;
    }
    
    comments.forEach(comment => {
        const commentElement = document.createElement('div');
        commentElement.classList.add('comment');
        
        const commentText = document.createElement('div');
        commentText.classList.add('comment-text');
        commentText.textContent = comment.text;
        
        const commentDate = document.createElement('div');
        commentDate.classList.add('comment-date');
        commentDate.textContent = formatDate(comment.date);
        
        commentElement.appendChild(commentText);
        commentElement.appendChild(commentDate);
        commentsListElement.appendChild(commentElement);
    });
}

// 사용자 ID 가져오기 (로컬 스토리지에 저장된 임의의 ID)
function getUserId() {
    let userId = localStorage.getItem('userId');
    
    if (!userId) {
        userId = 'user_' + Date.now().toString();
        localStorage.setItem('userId', userId);
    }
    
    return userId;
}

// 날짜 포맷팅
function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffMins < 1) {
        return '방금 전';
    } else if (diffMins < 60) {
        return `${diffMins}분 전`;
    } else if (diffHours < 24) {
        return `${diffHours}시간 전`;
    } else if (diffDays < 7) {
        return `${diffDays}일 전`;
    } else {
        return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;
    }
}

// 앱 초기화
document.addEventListener('DOMContentLoaded', init); 