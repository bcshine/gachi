// 초기 데이터 및 전역 변수
const HASHTAG_SUGGESTIONS = ['#성장', '#연대', '#사랑', '#평화', '#자유', '#정의', '#창의', '#지혜', '#성실', '#감사'];
const DAILY_SUBMISSION_LIMIT = 5;
let values = [];
let activeTab = 'all';

// 로컬 스토리지에서 데이터 로드 (안전하게 처리)
try {
    const storedValues = localStorage.getItem('values');
    if (storedValues) {
        values = JSON.parse(storedValues);
        console.log('로컬 스토리지에서 데이터 로드 성공:', values.length + '개 항목');
    }
} catch (error) {
    console.error('로컬 스토리지 데이터 로드 오류:', error);
    values = [];
}

// DOM 요소 초기화 함수
function initializeDOMElements() {
    console.log('DOM 요소 초기화 시작');
    
    // DOM 요소 초기화
    window.valueForm = document.getElementById('value-form');
    window.valueInput = document.getElementById('value-input');
    window.hashtagSuggestions = document.getElementById('hashtag-suggestions');
    window.submissionLimitMessage = document.getElementById('submission-limit-message');
    window.valuesList = document.getElementById('values-list');
    window.tabButtons = document.querySelectorAll('.tab-btn');
    
    // 요소 존재 확인
    if (!window.valueForm) console.error('value-form을 찾을 수 없음');
    if (!window.valueInput) console.error('value-input을 찾을 수 없음');
    if (!window.hashtagSuggestions) console.error('hashtag-suggestions를 찾을 수 없음');
    if (!window.submissionLimitMessage) console.error('submission-limit-message를 찾을 수 없음');
    if (!window.valuesList) console.error('values-list를 찾을 수 없음');
    if (!window.tabButtons || window.tabButtons.length === 0) console.error('tab-btn을 찾을 수 없음');
    
    console.log('DOM 요소 초기화 완료');
}

// 초기화 함수
function init() {
    console.log('앱 초기화 시작');
    
    // DOM 요소 초기화
    initializeDOMElements();
    
    if (!window.valueForm || !window.valuesList) {
        console.error('필수 DOM 요소를 찾을 수 없음, 1초 후 다시 시도');
        setTimeout(init, 1000);
        return;
    }
    
    renderHashtagSuggestions();
    checkSubmissionLimit();
    renderValues();
    
    // 이벤트 리스너 설정
    console.log('이벤트 리스너 설정');
    window.valueForm.addEventListener('submit', handleValueSubmit);
    window.valueInput.addEventListener('input', handleValueInput);
    window.tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            activeTab = btn.dataset.tab;
            setActiveTab(btn);
            renderValues();
        });
    });
    
    console.log('앱 초기화 완료');
}

// 해시태그 제안 렌더링
function renderHashtagSuggestions() {
    console.log('해시태그 제안 렌더링');
    window.hashtagSuggestions.innerHTML = '';
    HASHTAG_SUGGESTIONS.forEach(tag => {
        const tagElement = document.createElement('span');
        tagElement.classList.add('hashtag');
        tagElement.textContent = tag;
        tagElement.addEventListener('click', () => {
            window.valueInput.value += ` ${tag}`;
            window.valueInput.focus();
        });
        window.hashtagSuggestions.appendChild(tagElement);
    });
}

// 입력 처리 함수
function handleValueInput(e) {
    // 필요 시 해시태그 자동 완성 로직 추가
}

// 가치관 제출 처리
function handleValueSubmit(e) {
    e.preventDefault();
    console.log('가치관 제출 처리 시작');
    
    if (!canSubmitToday()) {
        window.submissionLimitMessage.textContent = `하루 ${DAILY_SUBMISSION_LIMIT}회 한정입니다.`;
        console.log('제출 제한 초과');
        return;
    }
    
    const valueText = window.valueInput.value.trim();
    if (!valueText) {
        console.log('빈 입력 감지');
        return;
    }
    
    console.log('입력 텍스트:', valueText);
    
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
    
    console.log('추출된 해시태그:', hashtags);
    console.log('정리된 텍스트:', cleanedText);
    
    // 가치관 객체 생성
    const newValue = {
        id: Date.now().toString(),
        text: cleanedText || valueText, // 해시태그만 있는 경우 원래 텍스트 사용
        hashtags: hashtags,
        date: new Date().toISOString(),
        likes: 0,
        likedBy: [],
        comments: []
    };
    
    console.log('새 가치관 객체:', newValue);
    
    // 데이터 저장
    values.unshift(newValue);
    saveValues();
    
    // 폼 리셋 및 UI 업데이트
    window.valueInput.value = '';
    checkSubmissionLimit();
    renderValues();
    
    console.log('가치관 제출 처리 완료');
}

// 하루 제출 수 체크
function canSubmitToday() {
    const today = new Date().toDateString();
    const todaysSubmissions = values.filter(v => {
        try {
            const valueDate = new Date(v.date).toDateString();
            return valueDate === today;
        } catch (error) {
            console.error('날짜 파싱 오류:', error, v);
            return false;
        }
    }).length;
    
    console.log('오늘 제출 수:', todaysSubmissions, '/', DAILY_SUBMISSION_LIMIT);
    return todaysSubmissions < DAILY_SUBMISSION_LIMIT;
}

// 제출 제한 체크 및 UI 업데이트
function checkSubmissionLimit() {
    if (!canSubmitToday()) {
        window.submissionLimitMessage.textContent = `오늘은 이미 ${DAILY_SUBMISSION_LIMIT}개의 가치관을 등록했습니다.`;
        window.valueForm.querySelector('button').disabled = true;
    } else {
        const today = new Date().toDateString();
        const todaysSubmissions = values.filter(v => {
            try {
                const valueDate = new Date(v.date).toDateString();
                return valueDate === today;
            } catch (error) {
                console.error('날짜 파싱 오류:', error, v);
                return false;
            }
        }).length;
        
        window.submissionLimitMessage.textContent = `오늘 ${todaysSubmissions}/${DAILY_SUBMISSION_LIMIT}개 가치관 등록됨`;
        window.valueForm.querySelector('button').disabled = false;
    }
}

// 탭 활성화
function setActiveTab(clickedTab) {
    window.tabButtons.forEach(btn => btn.classList.remove('active'));
    clickedTab.classList.add('active');
}

// 데이터 저장
function saveValues() {
    try {
        localStorage.setItem('values', JSON.stringify(values));
        console.log('데이터 저장 성공:', values.length + '개 항목');
    } catch (error) {
        console.error('데이터 저장 오류:', error);
    }
}

// 가치관 렌더링
function renderValues() {
    console.log('가치관 렌더링 시작');
    window.valuesList.innerHTML = '';
    
    let filteredValues = [...values];
    console.log('총 가치관 수:', filteredValues.length);
    
    // 탭에 따른 필터링
    if (activeTab === 'today') {
        const today = new Date().toDateString();
        filteredValues = filteredValues.filter(v => {
            try {
                const valueDate = new Date(v.date).toDateString();
                return valueDate === today;
            } catch (error) {
                console.error('날짜 파싱 오류:', error, v);
                return false;
            }
        });
        // 오늘의 TOP 10으로 제한
        filteredValues.sort((a, b) => b.likes - a.likes);
        filteredValues = filteredValues.slice(0, 10);
        console.log('오늘 TOP 10 필터링 후:', filteredValues.length);
    } else if (activeTab === 'weekly') {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        filteredValues = filteredValues.filter(v => {
            try {
                const valueDate = new Date(v.date);
                return valueDate >= weekAgo;
            } catch (error) {
                console.error('날짜 파싱 오류:', error, v);
                return false;
            }
        });
        // 좋아요순 정렬
        filteredValues.sort((a, b) => b.likes - a.likes);
        console.log('주간 필터링 후:', filteredValues.length);
    }
    
    if (filteredValues.length === 0) {
        window.valuesList.innerHTML = '<p class="no-values">표시할 가치관이 없습니다.</p>';
        console.log('표시할 가치관 없음');
        return;
    }
    
    filteredValues.forEach(value => {
        try {
            const cardElement = createValueCard(value);
            window.valuesList.appendChild(cardElement);
        } catch (error) {
            console.error('카드 생성 오류:', error, value);
        }
    });
    
    console.log('가치관 렌더링 완료:', filteredValues.length + '개 렌더링됨');
}

// 가치관 카드 생성
function createValueCard(value) {
    console.log('카드 생성:', value.id);
    const template = document.getElementById('value-card-template');
    if (!template) {
        console.error('value-card-template을 찾을 수 없음');
        return document.createElement('div'); // 빈 요소 반환
    }
    
    const cardClone = document.importNode(template.content, true);
    
    // 카드 내용 채우기
    const card = cardClone.querySelector('.value-card');
    card.id = `value-${value.id}`;
    
    const valueText = card.querySelector('.value-text');
    valueText.textContent = value.text;
    
    const hashtagsContainer = card.querySelector('.value-hashtags');
    if (value.hashtags && Array.isArray(value.hashtags)) {
        value.hashtags.forEach(tag => {
            const tagElement = document.createElement('span');
            tagElement.classList.add('hashtag');
            tagElement.textContent = tag;
            hashtagsContainer.appendChild(tagElement);
        });
    }
    
    const dateElement = card.querySelector('.value-date');
    dateElement.textContent = formatDate(value.date);
    
    // 좋아요 버튼 설정
    const likeBtn = card.querySelector('.like-btn');
    const likeCount = likeBtn.querySelector('.like-count');
    likeCount.textContent = value.likes || 0;
    
    // 사용자가 이미 좋아요 했는지 확인
    const userId = getUserId();
    if (value.likedBy && value.likedBy.includes(userId)) {
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
    
    if (valueIndex < 0) {
        console.error('좋아요 처리 실패: 해당 ID의 가치관을 찾을 수 없음', valueId);
        return;
    }
    
    const value = values[valueIndex];
    
    // likedBy 배열이 없으면 초기화
    if (!value.likedBy) value.likedBy = [];
    
    // 이미 좋아요 했는지 확인
    const alreadyLiked = value.likedBy.includes(userId);
    
    if (alreadyLiked) {
        // 좋아요 취소
        value.likes = Math.max(0, value.likes - 1);
        value.likedBy = value.likedBy.filter(id => id !== userId);
        likeBtn.classList.remove('liked');
        console.log('좋아요 취소:', valueId);
    } else {
        // 좋아요 추가
        value.likes = (value.likes || 0) + 1;
        value.likedBy.push(userId);
        likeBtn.classList.add('liked');
        console.log('좋아요 추가:', valueId);
    }
    
    // 좋아요 수 업데이트
    likeBtn.querySelector('.like-count').textContent = value.likes;
    
    // 데이터 저장
    saveValues();
}

// 댓글 추가
function addComment(valueId, commentText) {
    const valueIndex = values.findIndex(v => v.id === valueId);
    
    if (valueIndex < 0) {
        console.error('댓글 추가 실패: 해당 ID의 가치관을 찾을 수 없음', valueId);
        return;
    }
    
    // comments 배열이 없으면 초기화
    if (!values[valueIndex].comments) values[valueIndex].comments = [];
    
    const comment = {
        id: Date.now().toString(),
        text: commentText,
        date: new Date().toISOString()
    };
    
    values[valueIndex].comments.push(comment);
    saveValues();
    console.log('댓글 추가:', valueId, commentText);
}

// 댓글 렌더링
function renderComments(valueId, commentsListElement) {
    const valueIndex = values.findIndex(v => v.id === valueId);
    
    if (valueIndex < 0) {
        console.error('댓글 렌더링 실패: 해당 ID의 가치관을 찾을 수 없음', valueId);
        return;
    }
    
    // comments 배열이 없으면 초기화
    if (!values[valueIndex].comments) values[valueIndex].comments = [];
    
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
        console.log('새 사용자 ID 생성:', userId);
    }
    
    return userId;
}

// 날짜 포맷팅
function formatDate(dateString) {
    try {
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
    } catch (error) {
        console.error('날짜 포맷팅 오류:', error, dateString);
        return '날짜 오류';
    }
}

// 앱 초기화 - DOMContentLoaded 이벤트에 연결
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOMContentLoaded 이벤트 발생, 앱 초기화 시작');
    // 약간의 지연을 두고 초기화 (모든 DOM이 완전히 로드되도록)
    setTimeout(init, 100);
}); 